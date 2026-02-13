from django.db import models
from django.conf import settings


class Department(models.Model):
    """Model representing a department that handles specific complaint categories"""

    ROLE_CHOICES = [
        ('ward_officer', 'Ward Officer'),
        ('cdo', 'CDO'),
        ('municipality', 'Municipality'),
        ('department_head', 'Department Head'),
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    # Categories this department is responsible for (stored as comma-separated values)
    categories = models.CharField(
        max_length=200,
        help_text="Comma-separated category codes this department handles, e.g. 'water,electricity'"
    )

    def __str__(self):
        return self.name

    def get_categories_list(self):
        return [c.strip() for c in self.categories.split(',') if c.strip()]


class AdminProfile(models.Model):
    """Links a staff user to a department with a specific role"""

    ROLE_CHOICES = [
        ('ward_officer', 'Ward Officer'),
        ('cdo', 'CDO'),
        ('municipality', 'Municipality'),
        ('department_head', 'Department Head'),
        ('super_admin', 'Super Admin'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_profile'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admins'
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='ward_officer')

    def __str__(self):
        dept = self.department.name if self.department else 'No Department'
        return f"{self.user.username} — {self.get_role_display()} ({dept})"


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
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Submitted')
    image = models.ImageField(upload_to='complaint_images/', null=True, blank=True)

    # Department assignment
    assigned_department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )

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


class ComplaintImage(models.Model):
    """Model for storing multiple images per complaint"""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='complaint_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.complaint.complaint_id}"


class Upvote(models.Model):
    """Model representing an upvote on a complaint"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='upvotes')
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='upvotes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'complaint')

    def __str__(self):
        return f"{self.user.username} upvoted {self.complaint.complaint_id}"
