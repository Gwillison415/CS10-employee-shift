# Generated by Django 2.1.1 on 2018-09-24 18:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shiftapp', '0005_auto_20180920_1817'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='email_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='text_enabled',
            field=models.BooleanField(default=False),
        ),
    ]
