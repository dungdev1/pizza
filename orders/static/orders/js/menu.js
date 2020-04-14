import {getCookie, checkLoggedIn} from './base.js'

document.addEventListener('DOMContentLoaded', () => {

    var csrftoken = getCookie('csrftoken');
    const request = new Request(
        '/menu',
        {
            headers: { 'X-CSRFToken': csrftoken },
            method: 'POST',
            mode: 'same-origin',
        }
    );
    fetch(request)
    .then(response => response.json())
    .then(data => {
        const regularPizzas = data['regular_pizzas'];
        const sicilianPizzas = data['sicilian_pizzas'];
        const subs = data['subs'];
        const pastas = data['pastas'];
        const salads = data['salads'];
        const dinnerPlatters = data['dinner_platters'];
        const toppings = data['toppings'];

        regularPizzas.forEach(pizza => {
            const template = Handlebars.compile(document.querySelector('#item-type-1').innerHTML);
            let content = template({
                name: pizza['name'], 
                smSizePrice: pizza['small_size'], 
                lgSizePrice: pizza['large_size'], 
                item_id: 'regular-pizza-' + pizza['id']
            })            
            document.querySelector('.regular-pizza tbody').innerHTML += content;
            if (pizza['name'].includes('topping')) {
                document.querySelector(`.regular-pizza #regular-pizza-${pizza['id']}`)
                .querySelector('.item-btn').innerHTML = '<button type="button" class="btn btn-outline-light order" data-toggle="modal" data-target="#toppingDialog">Order</button>'
            }
        });

        sicilianPizzas.forEach(pizza => {
            const template = Handlebars.compile(document.querySelector('#item-type-1').innerHTML);
            let content = template({
                name: pizza['name'], 
                smSizePrice: pizza['small_size'], 
                lgSizePrice: pizza['large_size'], 
                item_id: 'sicilian-pizza-' + pizza['id']
            });
            document.querySelector('.sicilian-pizza tbody').innerHTML += content;
        });

        subs.forEach(sub => {
            const template = Handlebars.compile(document.querySelector('#item-type-1').innerHTML);
            let content = template({
                name: sub['name'],
                smSizePrice: sub['small_size'], 
                lgSizePrice: sub['large_size'], 
                item_id: 'sub-' + sub['id']
            });
            document.querySelector('.sub tbody').innerHTML += content;
        });

        pastas.forEach(pasta => {
            const template = Handlebars.compile(document.querySelector('#item-type-2').innerHTML);
            let content = template({
                name: pasta['name'], 
                price: pasta['price'], 
                item_id: 'pasta-' + pasta['id']
            });
            document.querySelector('.pasta tbody').innerHTML += content;
        });

        salads.forEach(salad => {
            const template = Handlebars.compile(document.querySelector('#item-type-2').innerHTML);
            let content = template({
                name: salad['name'], 
                price: salad['price'], 
                item_id: 'salad-' + salad['id']
            });
            document.querySelector('.salad tbody').innerHTML += content;
        });

        dinnerPlatters.forEach(platter => {
            const template = Handlebars.compile(document.querySelector('#item-type-1').innerHTML);
            let content = template({
                name: platter['name'], 
                smSizePrice: platter['small_size'], 
                lgSizePrice: platter['large_size'], 
                item_id: 'dinner-platter-' + platter['id'],
            });
            document.querySelector('.dinner-platter tbody').innerHTML += content;
        });

        toppings.forEach(topping => {
            const template = Handlebars.compile(document.querySelector('#item-type-3').innerHTML);
            let content = template({
                name: topping['name'], 
                item_id: 'topping-' + topping['id']
            });
            document.querySelector('.list-toppings').innerHTML += content;
        });
    });
});

let numTopping = -1;
let toppingsChoosed = [];
document.addEventListener('click', event => {
    const element = event.target;
    if (element.classList.contains('order')) {
        const item = element.parentElement.parentElement;

        // Topping dialog event when order pizza
        if (item.querySelector('.name').innerHTML.includes('topping')) {
            numTopping = Number(item.querySelector('.name').innerHTML[0]);
            document.querySelector('.modal-header .num-topping').innerHTML = numTopping;
            toppingsChoosed = [];
            document.querySelector('.num-topping-choosed').innerHTML = toppingsChoosed.length;
            document.querySelectorAll('#toppingDialog .topping a').forEach(element => {
                element.style.backgroundColor = 'unset';
                element.style.pointerEvents = 'auto';
                element.style.opacity = '1';
            });

            document.querySelector('#add-cart-btn').onclick = () => {
                saveItem(item, toppingsChoosed);
            };
        }
        else {
            saveItem(item);
        }
    }
});

// Topping dialog event when choose topping
setTimeout(() => {
    document.querySelectorAll('#toppingDialog .topping a').forEach(element => {
        element.addEventListener('click', event => {
            console.log('ok');
            if (element.style.backgroundColor == 'rgb(250, 197, 100)') {
                element.style.backgroundColor = 'unset';
                const index = toppingsChoosed.indexOf(Number(element.parentElement.id.charAt(element.parentElement.id.length - 1)));
                if (index !== -1) toppingsChoosed.splice(index, 1);
            }
            else {
                event.target.style.backgroundColor = 'rgb(250, 197, 100)';
                toppingsChoosed.push(Number(element.parentElement.id.charAt(element.parentElement.id.length - 1)));
            }
            document.querySelector('.num-topping-choosed').innerHTML = toppingsChoosed.length;
            if (toppingsChoosed.length === numTopping) {
                document.querySelectorAll('#toppingDialog .topping a').forEach(element => {
                    if (element.style.backgroundColor !== 'rgb(250, 197, 100)') {
                        element.style.pointerEvents = 'none';
                        element.style.opacity = '0.5';
                    }
                });
            }
            else {
                document.querySelectorAll('#toppingDialog .topping a').forEach(element => {
                    if (element.style.backgroundColor !== 'rgb(250, 197, 100)') {
                        element.style.pointerEvents = 'auto';
                        element.style.opacity = '1';
                    }
                });
            }
        });
    });
}, 500);


function saveItem(item, toppings = []) {
    // Get information of item for cart
    const sizeElem = item.querySelector('.size');
    let size = null;
    if (sizeElem !== null) {
        const e = sizeElem.querySelector('#size');
        size = e.options[e.selectedIndex].value;
    }
    const itemInfo = {
        _type: item.id.substring(0, item.id.length - 2),
        _id: item.id.charAt(item.id.length - 1),
        size: size,
        toppings: toppings
    };

    if (!localStorage.getItem('numItem'))
            localStorage.setItem('numItem', '0')
        
    let numItem = Number(localStorage.getItem('numItem'));
    numItem++;
    localStorage.setItem('numItem', numItem);

    if (!checkLoggedIn()) {
        // Save data to local Storage.
        
        localStorage.setItem(`item-${numItem}`, JSON.stringify(itemInfo));
        document.querySelector('.item-cart-count').innerHTML = numItem;
    }
    else {
        // Save data to database.
        const request = new XMLHttpRequest();
        var csrftoken = getCookie('csrftoken');
        request.open('POST', '/additem');
        request.setRequestHeader('X-CSRFToken', csrftoken);
        
        const data = new FormData();
        data.append('item', JSON.stringify(itemInfo));
        request.send(data);
    }
    document.querySelector('.item-cart-count').innerHTML = localStorage.getItem('numItem', numItem);
}

