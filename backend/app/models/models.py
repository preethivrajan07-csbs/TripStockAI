from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime
from app.database.connection import Base

class HistoricalRecord(Base):
    __tablename__ = "historical_records"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True) # YYYY-MM-DD
    destination = Column(String, index=True) # Goa, Dubai, etc.
    inventory_type = Column(String, index=True) # Hotel or Flight
    supplier_name = Column(String, index=True)
    searches = Column(Integer, default=0)
    bookings = Column(Integer, default=0)
    look_to_book = Column(Float, default=0.0) # searches / bookings
    available_inventory = Column(Integer, default=0)
    sold_out = Column(Integer, default=0) # 1 if sold out, 0 otherwise
    procurement_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    cancellations = Column(Integer, default=0)
    seasonality_index = Column(Float, default=1.0)
    lead_time_days = Column(Integer, default=14)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    supplier_type = Column(String) # Hotel Chain, Airline Partner, Bedbank Wholesaler
    destinations = Column(String) # Comma-separated or JSON
    procurement_price_avg = Column(Float, default=4500.0)
    available_capacity = Column(Integer, default=500)
    reliability_score = Column(Float, default=95.0) # Percentage 0-100
    cancellation_conditions = Column(String, default="Refundable up to 7 days before checkin")
    status = Column(String, default="Active") # Active, Paused, Review
    contact_email = Column(String, default="procurement@partner.com")

class OptimizationScenarioRecord(Base):
    __tablename__ = "optimization_scenarios"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    budget = Column(Float, default=5000000.0)
    risk_preference = Column(String, default="balanced") # conservative, balanced, aggressive
    total_allocated = Column(Float, default=0.0)
    unused_budget = Column(Float, default=0.0)
    expected_revenue = Column(Float, default=0.0)
    expected_profit = Column(Float, default=0.0)
    expected_roi = Column(Float, default=0.0)
    expected_unsold_loss = Column(Float, default=0.0)
    expected_cancellation_loss = Column(Float, default=0.0)
    allocations_json = Column(Text, default="[]")
    rationale = Column(Text, default="")
