# Generated by Django 5.1.1 on 2024-10-11 15:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='listingimage',
            name='image_name',
            field=models.CharField(blank=True, max_length=255, unique=True),
        ),
    ]