import {getItems, getCookie, checkLoggedIn, handleLogginForm} from './base.js'

const pizzaTemplate = Handlebars.compile(document.querySelector('#pizza-template').innerHTML);
const subDinnerPlatterTemplate = Handlebars.compile(document.querySelector('#sub-dinnerplatter').innerHTML);
const pastaSalad = Handlebars.compile(document.querySelector('#pasta-salad').innerHTML);
document.addEventListener('DOMContentLoaded', () => {
    const items = getItems();
    let totalPrice = 0;
    items.forEach(item => {
        var csrftoken = getCookie('csrftoken');

        const request = new XMLHttpRequest();
        let itemInfoDetail = {};
        request.open('POST', `item/${item['_type']}/${item['_id']}`, false);
        request.setRequestHeader('X-CSRFToken', csrftoken);
        request.onload = () => {
            itemInfoDetail = JSON.parse(request.responseText);
        }
        request.send();

        let toppingsInfo = []
        if (item['toppings'].length > 0) {
            item['toppings'].forEach(toppingId => {
                const request = new XMLHttpRequest();
                request.open('POST', `item/topping/${toppingId}`, false);
                request.setRequestHeader('X-CSRFToken', csrftoken);
                request.onload = () => {
                    toppingsInfo.push(JSON.parse(request.responseText)['name']);
                };
                request.send();
            });
        }

        let unitPrice = 0;
        let amount = 1;
        if (item['_type'].includes('pizza')) {
            unitPrice = itemInfoDetail[`${item['size']}_size`];
            const content = pizzaTemplate({
                name: itemInfoDetail['name'],
                size: item['size'],
                unitPrice: unitPrice,
                amount: amount,
                totalPrice: unitPrice * amount,
                toppings: toppingsInfo
            });
            
            if (item['_type'] === 'regular-pizza') {
                document.querySelector('.regular-items').innerHTML += content;
                document.querySelector('.regular-items').style.display = 'block';
            }
                
            else if (item['_type'] === 'sicilian-pizza') {
                document.querySelector('.sicilian-items').innerHTML += content;
                document.querySelector('.sicilian-items').style.display = 'block';
            }                
        }
        else if (item['_type'] === 'sub' || item['_type'] === 'dinner-platter') {
            unitPrice = itemInfoDetail[`${item['size']}_size`];
            const content = subDinnerPlatterTemplate({
                name: itemInfoDetail['name'],
                size: item['size'],
                unitPrice: unitPrice,
                amount: amount,
                totalPrice: unitPrice * amount,
            });
            if (item['_type'] === 'sub') {
                document.querySelector('.sub-items').innerHTML += content;
                document.querySelector('.sub-items').style.display = 'block';
            }
            else if (item['_type'] === 'dinner-platter') {
                document.querySelector('.dinner-platter-items').innerHTML += content;
                document.querySelector('.dinner-platter-items').style.display = 'block';
            }
        }
        else if(item['_type'] === 'pasta' || item['_type'] === 'salad') {
            unitPrice = itemInfoDetail['price'];
            const content = pastaSalad({
                name: itemInfoDetail['name'],
                unitPrice: unitPrice,
                amount: amount,
                totalPrice: unitPrice * amount,
            });
            if (item['_type'] === 'pasta') {
                document.querySelector('.pasta-items').innerHTML += content;
                document.querySelector('.pasta-items').style.display = 'block';
            }
            else if (item['_type'] === 'salad') {
                document.querySelector('.salad-items').innerHTML += content;
                document.querySelector('.salad-items').style.display = 'block';
            }
        }
        totalPrice += unitPrice * amount;
    });

    document.querySelector('.total-order .num').innerHTML = totalPrice;
    document.querySelector('.total .num').innerHTML = Number(document.querySelector('.tax .num').innerHTML) + totalPrice;
})

document.querySelector('.btn-checkout').onclick = () => {
    if (!checkLoggedIn()) {
        // Add form to modal
        // Default form is loggin form
        document.querySelector('.signup').style.borderBottom = 'none';
        document.querySelector('.signin').style.borderBottom = '3px solid rgb(27, 168, 255)';
        const form = Handlebars.compile(document.querySelector('#signin-form').innerHTML);
        document.querySelector('.form-account').innerHTML = form();
        handleLogginForm();
        // Open modal
        $("#accountModal").modal();
    }
    else
        location.href = location.protocol + '//' + document.domain + ':' + location.port + '/cart/checkout';
};