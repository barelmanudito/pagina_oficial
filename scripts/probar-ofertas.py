import copy
import importlib.util
import json
import math
import tempfile
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('prepare_menu', ROOT / 'scripts/preparar-menu.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
source = json.loads((ROOT / 'data/menu.json').read_text(encoding='utf-8'))
with tempfile.TemporaryDirectory() as temporary:
    root = Path(temporary)
    (root / 'data').mkdir()
    for value, valid in [(None, True), (1000, True), (0, False), (-1, False), (3400, False), (4000, False), ('1000', False), (True, False), (math.inf, False)]:
        data = copy.deepcopy(source)
        data['groups'][0]['items'][0]['discountPrice'] = value
        (root / 'data/menu.json').write_text(json.dumps(data), encoding='utf-8')
        try:
            module.build_menu(root)
        except AssertionError:
            assert not valid, value
        else:
            assert valid, value
            assert json.loads((root / 'menu-data.js').read_text(encoding='utf-8').split('window.menuContent = ')[1][:-2])['groups'][0]['items'][0]['discountPrice'] == value
print('OK: generación compatible y ofertas inválidas rechazadas (9 casos).')
app = ROOT.parents[1] / 'Manudito software de actualizacion'
if app.exists():
    sys.path.insert(0, str(app))
    from core import validate, AppError, FILES
    base = {name: json.loads((ROOT / name).read_text(encoding='utf-8')) for name in FILES}
    for value, valid in [(None, True), (1000, True), (0, False), (-1, False), (3400, False), ('1000', False), (True, False)]:
        data = copy.deepcopy(base)
        data[FILES[0]]['groups'][0]['items'][0]['discountPrice'] = value
        try:
            validate(data)
        except AppError:
            assert not valid, value
        else:
            assert valid, value
    for filename in ('core.py', 'manudito.py'):
        compile((app / filename).read_text(encoding='utf-8'), filename, 'exec')
    print('OK: validación de Windows (7 casos) y sintaxis Python.')
