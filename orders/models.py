from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class RegularPizza(models.Model):
    name = models.CharField(max_length=64)
    small_size = models.FloatField()
    large_size = models.FloatField()

    def __str__(self):
        return f"Regular pizza with {self.name} and small size price: {self.small_size}, lage size price: {self.large_size}"


class SicilianPizza(models.Model):
    name = models.CharField(max_length=64)
    small_size = models.FloatField()
    large_size = models.FloatField()

    def __str__(self):
        return f"Sicilian pizza with {self.name} and small size price: {self.small_size}, lage size price: {self.large_size}"


class Sub(models.Model):
    name = models.CharField(max_length=64)
    small_size = models.FloatField()
    large_size = models.FloatField()

    def __str__(self):
        return f"Subs with {self.name} and small size price: {self.small_size}, lage size price: {self.large_size}"


class Pasta(models.Model):
    name = models.CharField(max_length=64)
    price = models.FloatField()

    def __str__(self):
        return f"{self.name} pasta with price is {self.price}"

class Salad(models.Model):
    name = models.CharField(max_length=64)
    price = models.FloatField()

    def __str__(self):
        return f"{self.name} salad with price is {self.price}"

class DinnerPlatter(models.Model):
    name = models.CharField(max_length=64)
    small_size = models.FloatField()
    large_size = models.FloatField()

    def __str__(self):
        return f"{self.name} with small size price: {self.small_size}, lage size price: {self.large_size}"

class Topping(models.Model):
    name = models.CharField(max_length=64)
    
    def __str__(self):
        return f"{self.name} topping."

class Item(models.Model):
    _type = models.CharField(max_length=64)
    _id = models.IntegerField()
    size = models.CharField(max_length=64)
    toppings = models.ManyToManyField(Topping, blank=True, related_name='toppings')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE ,related_name="buyer")

    def __str__(self):
        return f"{self._type} with number id: {self._id} and size: {self.size}, toppings: {self.toppings.all()} of customer: {self.buyer}"
