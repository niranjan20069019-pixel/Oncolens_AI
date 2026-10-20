import base64
import io
from typing import Tuple

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image


def generate_gradcam(
    model: torch.nn.Module,
    input_tensor: torch.Tensor,
    target_class: int,
    original_pil: Image.Image,
) -> Tuple[str, Image.Image]:
    model.eval()
    activations: list[torch.Tensor] = []
    gradients: list[torch.Tensor] = []
    tensor = input_tensor.detach().requires_grad_(True)

    def forward_hook(_module, _inp, output):
        activations.append(output)

    def backward_hook(_module, _gin, gout):
        gradients.append(gout[0])

    target_layer = _resolve_target_layer(model)
    fh = target_layer.register_forward_hook(forward_hook)
    register_bw = getattr(target_layer, "register_full_backward_hook", target_layer.register_backward_hook)
    bh = register_bw(backward_hook)

    try:
        output = model(tensor)
        model.zero_grad()
        score = output[0, target_class]
        score.backward()

        acts = activations[0].detach()
        grads = gradients[0].detach()
        weights = grads.mean(dim=(2, 3), keepdim=True)
        cam = torch.relu((weights * acts).sum(dim=1, keepdim=True))
        cam = F.interpolate(cam, size=(tensor.shape[2], tensor.shape[3]), mode="bilinear", align_corners=False)
        cam = cam.squeeze().cpu().numpy()
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

        overlay = _overlay_cam(original_pil, cam)
        buf = io.BytesIO()
        overlay.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return b64, overlay
    finally:
        fh.remove()
        bh.remove()


def _resolve_target_layer(model: torch.nn.Module) -> torch.nn.Module:
    if hasattr(model, "features"):
        return model.features[-1]
    if hasattr(model, "layer4"):
        return model.layer4[-1]
    children = list(model.children())
    return children[-2] if len(children) > 1 else model


def _overlay_cam(pil_img: Image.Image, cam: np.ndarray) -> Image.Image:
    base = pil_img.resize((cam.shape[1], cam.shape[0])).convert("RGB")
    heat = np.uint8(255 * cam)
    heat_img = Image.fromarray(heat).convert("L").resize(base.size)
    heat_rgb = np.zeros((*base.size[::-1], 3), dtype=np.uint8)
    h_arr = np.asarray(heat_img).astype(np.float32) / 255.0
    heat_rgb[..., 0] = (h_arr * 80).astype(np.uint8)
    heat_rgb[..., 1] = (h_arr * 200).astype(np.uint8)
    heat_rgb[..., 2] = (h_arr * 255).astype(np.uint8)
    heat_pil = Image.fromarray(heat_rgb)
    return Image.blend(base, heat_pil, alpha=0.45)
