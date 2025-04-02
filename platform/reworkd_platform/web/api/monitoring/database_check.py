"""Database check endpoints for the monitoring API."""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import text
from typing import List, Dict, Any, Optional

from reworkd_platform.db.dependencies import get_db_session

router = APIRouter(prefix="/database", tags=["database"])

@router.get("/tables")
async def list_tables(session=Depends(get_db_session)):
    """List all tables in the database."""
    try:
        # Execute a query to get all tables
        tables_query = text("SHOW TABLES")
        result = await session.execute(tables_query)
        
        # Extract table names
        tables = [row[0] for row in result.fetchall()]
        
        return {
            "status": "success",
            "count": len(tables),
            "tables": tables
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/describe/{table_name}")
async def describe_table(table_name: str, session=Depends(get_db_session)):
    """Get schema information for a specific table."""
    try:
        # Execute a DESCRIBE query for the table
        describe_query = text(f"DESCRIBE `{table_name}`")
        result = await session.execute(describe_query)
        
        # Convert to list of dictionaries
        columns = []
        for row in result.fetchall():
            columns.append({
                "field": row[0],
                "type": row[1],
                "null": row[2],
                "key": row[3],
                "default": row[4],
                "extra": row[5]
            })
        
        return {
            "status": "success",
            "table": table_name,
            "columns": columns
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/required-tables")
async def check_required_tables(session=Depends(get_db_session)):
    """Check if all required tables for the application exist."""
    # These are the tables needed by the application
    required_tables = [
        "Account",
        "Session",
        "User",
        "VerificationToken",
        "Agent",
        "AgentTask",
        "Organization",
        "OrganizationUser"
    ]
    
    try:
        # Get all tables
        tables_query = text("SHOW TABLES")
        result = await session.execute(tables_query)
        existing_tables = [row[0] for row in result.fetchall()]
        
        # Check which tables exist
        table_status = []
        for table in required_tables:
            exists = table in existing_tables
            table_status.append({
                "table": table,
                "exists": exists
            })
        
        # Determine overall status
        all_tables_exist = all(status["exists"] for status in table_status)
        
        return {
            "status": "success" if all_tables_exist else "warning",
            "message": "All required tables exist" if all_tables_exist else "Some required tables are missing",
            "tables": table_status
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/connection")
async def check_connection(session=Depends(get_db_session)):
    """Verify database connection."""
    try:
        # Simple query to check connection
        result = await session.execute(text("SELECT 1 as connected"))
        connected = result.scalar() == 1
        
        # Get database version
        version_result = await session.execute(text("SELECT VERSION()"))
        version = version_result.scalar()
        
        return {
            "status": "success" if connected else "error",
            "connected": connected,
            "version": version,
            "message": "Database connection successful" if connected else "Database connection failed"
        }
    except Exception as e:
        return {
            "status": "error",
            "connected": False,
            "message": f"Database connection error: {str(e)}"
        }

@router.get("/check-all")
async def check_all(session=Depends(get_db_session)):
    """Run all database checks and return a comprehensive report."""
    try:
        # Check connection
        connection_result = await check_connection(session)
        
        # If connection fails, return early
        if connection_result["status"] == "error":
            return {
                "status": "error",
                "connection": connection_result,
                "message": "Database connection failed"
            }
        
        # Check tables
        tables_result = await list_tables(session)
        required_tables_result = await check_required_tables(session)
        
        # Get descriptions for existing tables
        table_descriptions = {}
        for table in required_tables_result["tables"]:
            if table["exists"]:
                description = await describe_table(table["table"], session)
                if description["status"] == "success":
                    table_descriptions[table["table"]] = description["columns"]
        
        return {
            "status": "success" if required_tables_result["status"] == "success" else "warning",
            "connection": connection_result,
            "tables": tables_result,
            "required_tables": required_tables_result,
            "table_descriptions": table_descriptions,
            "recommendations": get_recommendations(required_tables_result)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error running database checks: {str(e)}"
        }

def get_recommendations(required_tables_result: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on the database check results."""
    recommendations = []
    
    if required_tables_result["status"] != "success":
        missing_tables = [t["table"] for t in required_tables_result["tables"] if not t["exists"]]
        recommendations.append(f"Missing tables: {', '.join(missing_tables)}")
        recommendations.append("Run Prisma migrations to create missing tables:")
        recommendations.append("cd next && npx prisma db push")
        recommendations.append("or")
        recommendations.append("cd next && npx prisma migrate deploy")
    
    return recommendations