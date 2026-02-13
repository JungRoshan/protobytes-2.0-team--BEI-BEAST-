from django.db import models
from django.conf import settings

class Complaint(models.Model):
    """Model representing a city complaint/issue report"""
    
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]
    
    CATEGORY_CHOICES = [
        ('road', 'Road Issues'),
        ('waste', 'Waste Management'),
        ('water', 'Water Problems'),
        ('electricity', 'Electricity'),
        ('streetlight', 'Streetlight'),
        ('other', 'Other Issues'),
    ]
    
    # Auto-generated ID format: HA-2025-XXX
    complaint_id = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    location = models.CharField(max_length=300)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Submitted')
    image = models.ImageField(upload_to='complaint_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint_id} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Generate complaint_id on first save"""
        if not self.complaint_id:
            # Get the latest complaint to generate next ID
            import datetime
            year = datetime.datetime.now().year
            last_complaint = Complaint.objects.filter(
                complaint_id__startswith=f'HA-{year}-'
            ).order_by('-complaint_id').first()
            
            if last_complaint:
                # Extract number from last ID and increment
                last_num = int(last_complaint.complaint_id.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.complaint_id = f'HA-{year}-{new_num:03d}'
        
        super().save(*args, **kwargs)
