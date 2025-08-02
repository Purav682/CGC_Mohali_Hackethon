// Initialize Supabase connection
const supabaseUrl = 'https://mneybxkfdaomxhbxthfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZXlieGtmZGFvbXhoYnh0aGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzMzMTAsImV4cCI6MjA2NzMwOTMxMH0.gMFaObjVAIex-_S29uZJjKTVkX1VAqSiyfwXhszZcLM';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);