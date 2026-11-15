"""Valida los productos y genera los datos compartidos por ambas cartas."""
import json
import math
import re
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


def build_menu(root=ROOT):
    content = json.loads((root / "data/menu.json").read_text(encoding="utf-8"))
    ids = set()
    categories = {"bocas", "fuertes", "especialidades", "cervezas", "cocteles", "sin-alcohol", "combos"}
    for group in content["groups"]:
        assert group["category"] in categories, "Categoría desconocida"
        assert group["label"].strip(), "Falta el nombre del grupo"
        for item in group["items"]:
            assert re.fullmatch(r"[a-z0-9-]+", item["id"]), "Identificador inválido"
            assert item["id"] not in ids, "Hay identificadores de producto repetidos"
            ids.add(item["id"])
            assert item["name"].strip(), "Falta el nombre de un producto"
            assert type(item["price"]) in (int, float) and item["price"] >= 0, "Precio inválido"
            discount = item.get("discountPrice")
            assert discount is None or (type(discount) in (int, float) and math.isfinite(discount) and 0 < discount < item["price"]), "El precio de oferta debe ser positivo y menor al precio normal"
            photo = item.get("photo", "")
            assert not photo or (not urlsplit(photo).scheme and not photo.startswith("//") and ".." not in photo.split("/")), "La foto debe ser un archivo del sitio"
    output = "// Generado: editar data/menu.json desde el administrador.\nwindow.menuContent = "
    output += json.dumps(content, ensure_ascii=False) + ";\n"
    (root / "menu-data.js").write_text(output, encoding="utf-8")
    return content


if __name__ == "__main__":
    content = build_menu()
    print(f'Menú preparado: {sum(len(g["items"]) for g in content["groups"])} productos.')
