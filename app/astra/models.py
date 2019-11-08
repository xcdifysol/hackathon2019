from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200)

    def __str__(self):
        return self.name
    
class SubCategory(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return self.name
    
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True)
    brand = models.CharField(max_length=200, null=True)
    color = models.CharField(max_length=100, null=True)
    memory_capacity = models.CharField(max_length=100, null=True)
    memory_type = models.CharField(max_length=100, null=True)
    ram = models.CharField(max_length=100, null=True)
    price = models.IntegerField()
    image = models.ImageField(upload_to='images/')
    
    def __str__(self):
        return self.name
    
class Order(models.Model):
    order_number = models.CharField(max_length=8)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    unit_price = models.IntegerField()
    
    def __str__(self):
        return self.name