from supabase import create_client
import os

supabase = create_client(
    os.getenv('https://mneybxkfdaomxhbxthfe.supabase.co'),
    os.getenv('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZXlieGtmZGFvbXhoYnh0aGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzMzMTAsImV4cCI6MjA2NzMwOTMxMH0.gMFaObjVAIex-_S29uZJjKTVkX1VAqSiyfwXhszZcLM')
)

def log_attack(attack_data):
    """Store detected attacks in database"""
    supabase.table('sql_attacks').insert(attack_data).execute()