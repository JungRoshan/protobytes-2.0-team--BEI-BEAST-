from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Complaint
from django.contrib.auth.models import User

@receiver(post_save, sender=Complaint)
def create_complaint_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a complaint status changes.
    Logic:
    - If created: Notify admin (superuser)
    - If updated: Notify the user who created it (if we had a user field on Complaint)
    
    Current Limitation: Complaint model doesn't link to User yet.
    We will just notify all superusers for now as a demo.
    """
    if created:
        message = f"New complaint submitted: {instance.title} ({instance.complaint_id})"
    else:
        message = f"Complaint {instance.complaint_id} status updated to: {instance.status}"
    
    # Notify all admins
    from notifications.models import Notification
    admins = User.objects.filter(is_superuser=True)
    for admin in admins:
        Notification.objects.create(
            user=admin,
            complaint=instance,
            message=message
        )
