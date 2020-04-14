from django.http import HttpResponse, JsonResponse, HttpResponseRedirect, Http404, HttpResponseForbidden
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.forms.models import model_to_dict
from django.core import serializers

from .models import *

import json

# Create your views here.
def index(request):
    context = { "logged_in": False }
    if request.user.is_authenticated:
        context.__setitem__("logged_in", True)
        context.__setitem__("user", request.user)

    return render(request, "orders/index.html", context)

def menu(request):
    if request.method == 'GET':
        context = { "logged_in": False }
        if request.user.is_authenticated:
            context.__setitem__("logged_in", True)
            context.__setitem__("user", request.user)
            
        return render(request, "orders/menu.html", context)
    else:
        regular_pizzas = list(RegularPizza.objects.values())
        sicilian_pizzas = list(SicilianPizza.objects.values())
        subs = list(Sub.objects.values())
        pastas = list(Pasta.objects.values())
        salads = list(Salad.objects.values())
        dinner_platters = list(DinnerPlatter.objects.values())
        toppings = list(Topping.objects.values())

        return JsonResponse({
            "regular_pizzas": regular_pizzas,
            "sicilian_pizzas": sicilian_pizzas,
            "subs": subs,
            "pastas": pastas,
            "salads": salads,
            "dinner_platters": dinner_platters,
            "toppings": toppings
        })

def registration_view(request):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")

    username = request.POST["username"]
    password = request.POST["password"]
    users = User.objects.all()

    if username not in [user.username for user in users]:
        user = User.objects.create_user(username=username, password=password)
        user.save()
        login(request, user)
        return JsonResponse({"success": True})
    else:
        return JsonResponse({"success": False, "message": "User already exists."})

def login_view(request):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")

    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({"success": True})
    else:
        return JsonResponse({"success": False, "message": "Account or password is invalid"})

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('home'))

def checklogin_view(request):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")

    if request.user.is_authenticated:
        return JsonResponse({"logged_in": True})
    return JsonResponse({"logged_in": False})

def item_view(request, item_type, item_id):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")

    item = None
    if item_type == "regular-pizza":
        try:
            item = RegularPizza.objects.get(pk=item_id)
        except RegularPizza.DoesNotExist:
            raise Http404("Regular pizza does not exist.")
    elif item_type == "sicilian-pizza":
        try:
            item = SicilianPizza.objects.get(pk=item_id)
        except SicilianPizza.DoesNotExist:
            raise Http404("Sicilian pizza does not exist.")
    elif item_type == "sub":
        try:
            item = Sub.objects.get(pk=item_id)
        except Sub.DoesNotExist:
            raise Http404("Sub does not exist.")
    elif item_type == "pasta":
        try:
            item = Pasta.objects.get(pk=item_id)
        except Pasta.DoesNotExist:
            raise Http404("Pasta does not exist.")
    elif item_type == "salad":
        try:
            item = Salad.objects.get(pk=item_id)
        except Salad.DoesNotExist:
            raise Http404("Salad does not exist.")
    elif item_type == "dinner-platter":
        try:
            item = DinnerPlatter.objects.get(pk=item_id)
        except DinnerPlatter.DoesNotExist:
            raise Http404("Dinner platter does not exist.")
    elif item_type == "topping":
        try:
            item = Topping.objects.get(pk=item_id)
        except Topping.DoesNotExist:
            raise Http404("Topping does not exist.")

    if item is None:
        return Http404("Item does not exist")
    return JsonResponse(model_to_dict(item))

def add_item_view(request):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")
    item = json.loads(request.POST["item"])
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'User is not logged in'})

    # Type, id, and buyer is required for any item
    i = Item(_type=item.get('_type'), _id=int(item.get('_id')), buyer=request.user)
    i.save()

    if item.get('size'):
        i.size = item.get('size')

    toppings = item.get('toppings')
    for topping in toppings:
        t = Topping.objects.get(pk=int(topping))
        i.toppings.add(t)
    i.save()
    return JsonResponse({"success": True})

def get_items_view(request):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")

    user = request.user
    # Get items belong to user
    items = json.loads(serializers.serialize('json', user.buyer.all()))
    return JsonResponse({"items": items})

def delete_items_view(request):
    if request.method == 'GET':
        return HttpResponseForbidden("This method was denied.")

    user = request.user
    # Get items belong to user
    items = user.buyer.all()
    # Delete items
    for item in items:
        item.delete()
    print(user.buyer.all())
    return JsonResponse({"success": True})

def cart_view(request):
    if request.method == 'GET':
        context = { "logged_in": False }
        if request.user.is_authenticated:
            context.__setitem__("logged_in", True)
            context.__setitem__("user", request.user)
            
        return render(request, "orders/cart.html", context)
    
def checkout_view(request):
    context = {
        "message": "This feature is under development."
    }
    return render(request, 'orders/checkout.html', context)