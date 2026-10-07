/// <reference path="../../index.d.ts" />
import Xenon from 'xenon-view-sdk';

Xenon.purchase(['sku-1', 'sku-2'], 125, null, null, null, ['Laptop', 'Keyboard'], ['Dell', 'Apple']);
Xenon.purchase('sku-1', null, null, null, null, 'Laptop', 'Dell');
Xenon.purchaseCancel(null);
Xenon.purchaseCancel(['sku-1'], 100, ['Laptop'], ['Dell']);
Xenon.productAddedToCart('sku-1', 100, 'Laptop', 'Dell');
Xenon.upsold('sku-1', null, 'Laptop', 'Dell');
Xenon.upsellDismissed('sku-1', null, 'Laptop', 'Dell');
Xenon.productNotAddedToCart('sku-1', 'Laptop', 'Dell');
Xenon.productRemoved('sku-1', 'Laptop', 'Dell');
Xenon.productKept('sku-1', 'Laptop', 'Dell');
Xenon.productReturned('sku-1', 'Laptop', 'Dell');
Xenon.count('Purchase', 100, ['sku-1'], false, ['Laptop'], ['Dell']);
Xenon.count('Purchase');
// @ts-expect-error Names must be strings.
Xenon.purchase(['sku-1'], null, null, null, null, [123]);
// @ts-expect-error A single product outcome takes one name.
Xenon.productAddedToCart('sku-1', 100, ['Laptop'], 'Dell');
// @ts-expect-error The fourth count argument controls error surfacing.
Xenon.count('Purchase', 100, ['sku-1'], ['Laptop']);
