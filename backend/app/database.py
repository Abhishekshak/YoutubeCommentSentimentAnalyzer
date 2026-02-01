import psycopg2
from psycopg2.extras import RealDictCursor

DB_HOST = "localhost"
DB_NAME = "sentiment_db"
DB_USER = "postgres"
DB_PASSWORD = "admin"

def get_connection():
    """
    Returns a new connection to the PostgreSQL database.
    Use conn.cursor() to get a cursor.
    """
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=RealDictCursor
    )
    return conn
