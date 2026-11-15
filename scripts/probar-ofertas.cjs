const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8').split('menuGrid?.addEventListener')[0];
const grid = { innerHTML: '' };
const section = { hidden: true, querySelectorAll: () => [] };
const context = {
  window: { menuContent: { groups: [{category: 'bocas', label: 'Bocas', items: [
    {id:'promo', name:'Oferta <especial>', price:4000, discountPrice:3000},
    {id:'normal', name:'Normal', price:2000},
    {id:'hidden', name:'Oculto', price:4000, discountPrice:2000, available:false},
  ]}] } },
  document: { querySelector: (id) => id === '#ofertas' ? section : id === '#discounts-grid' ? grid : null, querySelectorAll: () => [] },
  Intl, assert,
};
vm.runInNewContext(source + `
assert.equal(menuItems.length, 2);
assert.equal(hasDiscount(menuItems[0]), true);
assert.equal(sellingPrice(menuItems[0]), 3000);
assert.equal(sellingPrice(menuItems[1]), 2000);
assert.equal(sellingPrice({price:4000, discountPrice:5000}), 4000);
assert.equal(sellingPrice({price:4000, discountPrice:0}), 4000);
assert.equal(sellingPrice({price:4000, discountPrice:'3000'}), 4000);
assert.equal(priceMarkup(menuItems[0]).includes('<del>'), true);
assert.equal(priceMarkup(menuItems[1]).includes('<del>'), false);
assert.equal(document.querySelector('#ofertas').hidden, false);
assert.match(document.querySelector('#discounts-grid').innerHTML, /25%/);
assert.match(document.querySelector('#discounts-grid').innerHTML, /Oferta &lt;especial&gt;/);
assert.doesNotMatch(document.querySelector('#discounts-grid').innerHTML, /Oculto/);
menuItems[0].discountPrice = null;
renderDiscounts();
assert.equal(document.querySelector('#ofertas').hidden, true);
`, context);
console.log('OK: precios, renderizado, ahorro, escape HTML, productos ocultos y ofertas vacias.');
