import random
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from app.models.models import HistoricalRecord, Supplier, OptimizationScenarioRecord

DESTINATIONS = [
    {"name": "Goa", "type": "leisure", "base_price_hotel": 4800, "base_price_flight": 5200, "base_demand": 320},
    {"name": "Dubai", "type": "international", "base_price_hotel": 11500, "base_price_flight": 22000, "base_demand": 280},
    {"name": "Delhi", "type": "metro", "base_price_hotel": 5200, "base_price_flight": 4800, "base_demand": 450},
    {"name": "Mumbai", "type": "metro", "base_price_hotel": 6400, "base_price_flight": 5100, "base_demand": 490},
    {"name": "Bengaluru", "type": "tech_hub", "base_price_hotel": 4500, "base_price_flight": 4400, "base_demand": 410},
    {"name": "Jaipur", "type": "heritage", "base_price_hotel": 4100, "base_price_flight": 4600, "base_demand": 230},
    {"name": "Kochi", "type": "leisure", "base_price_hotel": 3800, "base_price_flight": 5400, "base_demand": 210},
    {"name": "Singapore", "type": "international", "base_price_hotel": 14000, "base_price_flight": 26000, "base_demand": 240},
    {"name": "Hyderabad", "type": "metro", "base_price_hotel": 4200, "base_price_flight": 4300, "base_demand": 340},
    {"name": "Chennai", "type": "metro", "base_price_hotel": 3900, "base_price_flight": 4100, "base_demand": 310},
]

SUPPLIERS_DATA = [
    {"name": "Taj Hotels & Palaces", "supplier_type": "Hotel Chain", "destinations": "Goa, Mumbai, Delhi, Jaipur, Bengaluru", "procurement_price_avg": 8500.0, "available_capacity": 650, "reliability_score": 98.5, "cancellation_conditions": "Free cancellation up to 72 hours prior", "status": "Active", "contact_email": "b2b@ihcltata.com"},
    {"name": "IndiGo Airline Wholesale", "supplier_type": "Airline Partner", "destinations": "Delhi, Mumbai, Bengaluru, Goa, Hyderabad, Chennai, Kochi", "procurement_price_avg": 4600.0, "available_capacity": 1400, "reliability_score": 96.0, "cancellation_conditions": "Non-refundable corporate allotment with seat swap", "status": "Active", "contact_email": "procurement@goindigo.in"},
    {"name": "Marriott International Allotment", "supplier_type": "Hotel Chain", "destinations": "Goa, Dubai, Mumbai, Bengaluru, Delhi", "procurement_price_avg": 9200.0, "available_capacity": 580, "reliability_score": 97.2, "cancellation_conditions": "Refundable minus 10% administrative fee", "status": "Active", "contact_email": "partners@marriott.com"},
    {"name": "Emirates Corporate Inventory", "supplier_type": "Airline Partner", "destinations": "Dubai, Singapore, Mumbai, Delhi", "procurement_price_avg": 24500.0, "available_capacity": 420, "reliability_score": 99.1, "cancellation_conditions": "Flexible date change, 15% cancellation fee", "status": "Active", "contact_email": "allotments@emirates.com"},
    {"name": "Oberoi Hotels & Resorts", "supplier_type": "Hotel Chain", "destinations": "Jaipur, Delhi, Mumbai, Bengaluru", "procurement_price_avg": 12800.0, "available_capacity": 280, "reliability_score": 99.0, "cancellation_conditions": "Free cancellation up to 7 days prior", "status": "Active", "contact_email": "enterprise@oberoigroup.com"},
    {"name": "Air India B2B Channel", "supplier_type": "Airline Partner", "destinations": "Delhi, Mumbai, Bengaluru, Dubai, Singapore, Chennai", "procurement_price_avg": 5400.0, "available_capacity": 950, "reliability_score": 93.5, "cancellation_conditions": "Standard IATA cancellation rules apply", "status": "Active", "contact_email": "channel@airindia.com"},
    {"name": "Lemon Tree Hotels Network", "supplier_type": "Hotel Chain", "destinations": "Bengaluru, Hyderabad, Chennai, Delhi, Jaipur", "procurement_price_avg": 3400.0, "available_capacity": 720, "reliability_score": 94.8, "cancellation_conditions": "24-hour advance cancellation permitted", "status": "Active", "contact_email": "inventory@lemontreehotels.com"},
    {"name": "Singapore Airlines Direct Allotment", "supplier_type": "Airline Partner", "destinations": "Singapore, Mumbai, Delhi, Bengaluru", "procurement_price_avg": 27500.0, "available_capacity": 310, "reliability_score": 99.4, "cancellation_conditions": "Ticket reissuance free; cancellation 12%", "status": "Active", "contact_email": "b2b@singaporeair.com"},
    {"name": "Radisson Hotel Group", "supplier_type": "Hotel Chain", "destinations": "Goa, Delhi, Mumbai, Kochi, Hyderabad", "procurement_price_avg": 4900.0, "available_capacity": 510, "reliability_score": 95.5, "cancellation_conditions": "Free cancellation 48h before arrival", "status": "Active", "contact_email": "distribution@radisson.com"},
    {"name": "Akasa Air Corporate Sales", "supplier_type": "Airline Partner", "destinations": "Mumbai, Bengaluru, Delhi, Goa, Kochi", "procurement_price_avg": 4100.0, "available_capacity": 800, "reliability_score": 94.0, "cancellation_conditions": "Partial refund under corporate contract", "status": "Active", "contact_email": "sales@akasaair.com"},
    {"name": "ITC Luxury & Welcomhotel Bedbank", "supplier_type": "Hotel Chain", "destinations": "Goa, Jaipur, Bengaluru, Chennai, Mumbai", "procurement_price_avg": 7800.0, "available_capacity": 430, "reliability_score": 97.8, "cancellation_conditions": "Full refund up to 5 days prior", "status": "Active", "contact_email": "allotments@itchotels.in"},
    {"name": "Jumeirah Group Dubai Direct", "supplier_type": "Hotel Chain", "destinations": "Dubai", "procurement_price_avg": 18500.0, "available_capacity": 220, "reliability_score": 98.9, "cancellation_conditions": "Strict cancellation within 14 days", "status": "Active", "contact_email": "contracts@jumeirah.com"}
]

def seed_database_if_empty(db: Session):
    existing_suppliers = db.query(Supplier).count()
    if existing_suppliers == 0:
        for s in SUPPLIERS_DATA:
            sup = Supplier(**s)
            db.add(sup)
        db.commit()

    existing_records = db.query(HistoricalRecord).count()
    if existing_records > 0:
        return

    # Seed 90 days of rich historical travel data
    records_to_insert = []
    base_date = datetime.now() - timedelta(days=90)

    for day_offset in range(90):
        current_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        dt = base_date + timedelta(days=day_offset)
        day_of_week = dt.weekday() # 0-6 (5,6 weekend)
        month = dt.month

        for dest in DESTINATIONS:
            # Seasonality computation
            season_mult = 1.0
            if dest["name"] in ["Goa", "Dubai", "Jaipur", "Kochi"]:
                if month in [11, 12, 1, 2]:
                    season_mult = 1.45
                elif month in [10, 3]:
                    season_mult = 1.15
                elif month in [6, 7, 8]:
                    season_mult = 0.70
            elif dest["name"] in ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai"]:
                # Business hubs: Mon-Fri strong
                season_mult = 1.1 if day_of_week in [0, 1, 2, 3] else 0.9

            for inv_type in ["Hotel", "Flight"]:
                base_p = dest["base_price_hotel"] if inv_type == "Hotel" else dest["base_price_flight"]
                base_d = dest["base_demand"] * (1.1 if inv_type == "Flight" else 0.95)

                # Random fluctuations with deterministic seed
                random.seed(int(dt.timestamp()) + hash(dest["name"]) + hash(inv_type))
                noise = random.uniform(0.85, 1.22)
                demand = int(base_d * season_mult * noise)

                look_to_book_ratio = round(random.uniform(18.0, 38.0), 1)
                searches = int(demand * look_to_book_ratio)
                bookings = int(demand * random.uniform(0.75, 0.95))

                available_inv = int(demand * random.uniform(0.80, 1.30))
                sold_out = 1 if bookings >= available_inv else 0

                cancellation_rate = random.uniform(0.08, 0.20)
                cancellations = int(bookings * cancellation_rate)

                procurement_price = round(base_p * season_mult * random.uniform(0.92, 1.08), 2)
                margin_markup = random.uniform(1.18, 1.36)
                selling_price = round(procurement_price * margin_markup, 2)

                supplier_match = [s["name"] for s in SUPPLIERS_DATA if dest["name"] in s["destinations"] and (
                    ("Hotel" in s["supplier_type"] and inv_type == "Hotel") or
                    ("Airline" in s["supplier_type"] and inv_type == "Flight")
                )]
                chosen_supplier = supplier_match[0] if supplier_match else "Global Partner Allotment"

                record = HistoricalRecord(
                    date=current_date,
                    destination=dest["name"],
                    inventory_type=inv_type,
                    supplier_name=chosen_supplier,
                    searches=searches,
                    bookings=bookings,
                    look_to_book=look_to_book_ratio,
                    available_inventory=available_inv,
                    sold_out=sold_out,
                    procurement_price=procurement_price,
                    selling_price=selling_price,
                    cancellations=cancellations,
                    seasonality_index=round(season_mult, 2),
                    lead_time_days=random.randint(5, 30)
                )
                records_to_insert.append(record)

    db.bulk_save_objects(records_to_insert)
    db.commit()
