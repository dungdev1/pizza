export {getCookie, checkLoggedIn, getItems, handleRegisterForm, handleLogginForm};


document.querySelectorAll('.dropdown-item').forEach(item => {
    item.onclick = function() {
        let form  = '';
        let logginForm = false;
        if (this.classList.contains('signin-item')) {
            document.querySelector('.signup').style.borderBottom = 'none';
            document.querySelector('.signin').style.borderBottom = '3px solid rgb(27, 168, 255)';
            form = Handlebars.compile(document.querySelector('#signin-form').innerHTML);
            logginForm = true;
        }
        else {
            document.querySelector('.signin').style.borderBottom = 'none';
            document.querySelector('.signup').style.borderBottom = '3px solid rgb(27, 168, 255)';
            form = Handlebars.compile(document.querySelector('#signup-form').innerHTML);
        }

        document.querySelector('.form-account').innerHTML = form();
        if (logginForm)
            handleLogginForm();
        else
            handleRegisterForm();
    };
});

document.querySelector('.modal-body .header').addEventListener('mouseover', event => {
    event.target.style.cursor = "pointer";
});

document.querySelectorAll('.modal-body .header > div').forEach(element => {
    element.addEventListener('click', event => {
        
        let form = '';
        let logginForm = false;
        if (event.target.classList.contains('signin')) {
            form = Handlebars.compile(document.querySelector('#signin-form').innerHTML);
            logginForm = true;
        }
        else
            form = Handlebars.compile(document.querySelector('#signup-form').innerHTML);
            
        // add form correspond to sign in or sign up
        document.querySelector('.form-account').innerHTML = form();
        if (logginForm)
            handleLogginForm();
        else
            handleRegisterForm();

        // Change color of head form
        event.target.style.borderBottom = '3px solid rgb(27, 168, 255)';
        document.querySelectorAll('.modal-body .header > div').forEach(element => {
            if (element != event.target)
                element.style.borderBottom = '0';
        })
    })
});

document.addEventListener('DOMContentLoaded', () => {
    // Load number of item added to cart
    let items = getItems();
    document.querySelector('.item-cart-count').innerHTML = items.length;
    localStorage.setItem('numItem', items.length);
})


function handleRegisterForm() {
    document.querySelector('#registration-form').onsubmit = () => {
        const password = document.querySelector('#registration-form #password').value;
        const confirmPW = document.querySelector('#registration-form #confirmPassword').value;
        if (password === confirmPW) {
            var csrftoken = getCookie('csrftoken');
            const request = new Request(
                '/registration',
                {
                    headers: { 'X-CSRFToken': csrftoken },
                    method: 'POST',
                    mode: 'same-origin',
                    body: new FormData(document.querySelector('#registration-form'))
                }
            );
            fetch(request)
            .then(response => response.json())
            .then(data => {
                if (data['success']) 
                    location.reload();
                else
                    alert(data['message']);
            });
        }
        else {
            alert('Those passwords didn\'t match. Try again.');
        }
        return false;
    }
}

function handleLogginForm() {
    document.querySelector('#loggin-form').onsubmit = () => {
        var csrftoken = getCookie('csrftoken');
        const request = new Request(
            '/login',
            {
                headers: { 'X-CSRFToken': csrftoken },
                method: 'POST',
                mode: 'same-origin',
                body: new FormData(document.querySelector('#loggin-form'))
            }
        );
        fetch(request)
        .then(response => response.json())
        .then(data => {
            if (data['success']) {

                // Get items from local Storage
                let items = [];
                const numItem = localStorage.getItem('numItem') || 0;
                if (numItem > 0) {
                    for(let i = 1; i <= numItem; i++) {
                        items.push(JSON.parse(localStorage.getItem(`item-${i}`)));
                    }
                    // Delete items in local Storage
                    localStorage.clear();

                    // delete items of user from database (old items)
                    deleteItems();

                    // add to database  (new items)
                    items.forEach(item => {
                        // Save data to database.
                        const request = new XMLHttpRequest();
                        var csrftoken = getCookie('csrftoken');
                        request.open('POST', '/additem');
                        request.setRequestHeader('X-CSRFToken', csrftoken);
                        
                        const data = new FormData();
                        data.append('item', JSON.stringify(item));
                        request.send(data);
                    });
                }

                location.reload();
            }
                
            else
                alert(data['message']);
        });
        return false;
    }
}

function getItems() {
    let items = [];
    if (!checkLoggedIn()) {
        // Get items from local Storage
        const numItem = localStorage.getItem('numItem') || 0;
        if (numItem > 0) {
            for(let i = 1; i <= numItem; i++) {
                if (localStorage.getItem(`item-${i}`))
                    items.push(JSON.parse(localStorage.getItem(`item-${i}`)));
            }
        }
    }
    else {
        // Get items form database
        const request = new XMLHttpRequest();
        var csrftoken = getCookie('csrftoken');
        request.open('POST', '/getitems', false);
        request.setRequestHeader('X-CSRFToken', csrftoken);
        request.onload = () => {
            JSON.parse(request.responseText)['items'].forEach(item => {
                items.push(item.fields);
            });
        };
        request.send();
    }
    return items;
}

function deleteItems() {
    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');
    request.open('POST', '/deleteitems', false);
    request.setRequestHeader('X-CSRFToken', csrftoken);

    // send request
    request.send();
}

// modules
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function checkLoggedIn() {
    let isLogin = false;

    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');
    request.open('POST', '/loggedin', false);
    //request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader('X-CSRFToken', csrftoken);
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        isLogin = data["logged_in"];
    }
    request.send();
    return isLogin;
}