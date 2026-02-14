import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { fetchCartData } from 'src/app/store/Cart/cart.action';
import { selectData } from 'src/app/store/Cart/cart-selector';
import { Store } from '@ngrx/store';
import { cartData } from 'src/app/core/data';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: false
})

/**
 * Ecommerce Cart component
 */
export class CartComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;
  value: number;

  cartData = cartData;
  subtotal: any = 0;
  discount: any;
  discountRate = 0.15;
  shipping: any;
  shippingRate: any = '65.00';
  tax: any;
  taxRate = 0.125;
  totalprice: any;

  total: any;
  constructor(public store: Store) { }

  // ... (Component setup)

  ngOnInit() {

    this.value = 4;
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Cart', active: true }];
    this.subtotal = 0;

    this.store.dispatch(fetchCartData());
    this.store.select(selectData).subscribe(data => {
      this.cartData = data.map((x: any) => {
        const itemCopy = { ...x };
        itemCopy['total'] = (itemCopy['qty'] * itemCopy['price']).toFixed(2);
        this.subtotal += parseFloat(itemCopy['total']);

        return itemCopy;
      });
      this.subtotal = parseFloat(this.subtotal.toFixed(2));

      const subtotalNum = this.subtotal;
      const discountRateNum = this.discountRate;
      const taxRateNum = this.taxRate;
      const shippingRateNum = parseFloat(this.shippingRate);

      this.discount = (subtotalNum * discountRateNum).toFixed(2);
      this.tax = (subtotalNum * taxRateNum).toFixed(2);

      const totalPriceNum = subtotalNum + parseFloat(this.tax) + shippingRateNum - parseFloat(this.discount);
      this.totalprice = totalPriceNum.toFixed(2);
    });
  }
  
  delete(event: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          event.target.closest('tr')?.remove();
        }
      });
  }

  // Increment Decrement Quantity
  qty: number = 0;
  calculateQty(id: any, qty: any, i: any) {
    this.subtotal = 0;
    let productToUpdate = { ...this.cartData[i] };
    if (id === '0' && qty > 1) {
      productToUpdate.qty = qty - 1;
    } else if (id === '1') {
      productToUpdate.qty = qty + 1;
    }
    if (productToUpdate.qty !== this.cartData[i].qty) {
      productToUpdate.total = (productToUpdate.qty * productToUpdate.price).toFixed(2);

      this.cartData[i] = productToUpdate;
    }
    this.cartData.map((x: any) => {
      this.subtotal += parseFloat(x['total']);
    });
    this.subtotal = parseFloat(this.subtotal.toFixed(2));
    const subtotalNum = this.subtotal;

    const discountRateNum = this.discountRate;
    const taxRateNum = this.taxRate;
    const shippingRateNum = this.shippingRate;

    this.discount = (subtotalNum * discountRateNum).toFixed(2);
    this.tax = (subtotalNum * taxRateNum).toFixed(2);
    const totalPriceNum = subtotalNum + (subtotalNum * taxRateNum) + shippingRateNum - (subtotalNum * discountRateNum);
    this.totalprice = totalPriceNum.toFixed(2);
  }
}
