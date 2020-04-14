from django.urls import path, include

from . import views

urlpatterns = [
    path("", views.index, name="home"),
    path("menu", views.menu, name="menu"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("registration", views.registration_view, name="registration"),
    path("item/<str:item_type>/<int:item_id>", views.item_view, name="item"),
    path("loggedin", views.checklogin_view, name="loggedin"),
    path("additem", views.add_item_view, name="additem"),
    path("getitems", views.get_items_view, name="getitems"),
    path("deleteitems", views.delete_items_view, name="deleteitems"),
    path("cart", views.cart_view, name='cart'),
    path("cart/checkout", views.checkout_view, name='checkout'),
]
