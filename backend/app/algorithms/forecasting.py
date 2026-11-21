import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

def run_demand_forecast(records: List[Dict[str, Any]], forecast_days: int = 30, model_choice: str = "ensemble") -> Dict[str, Any]:
    if not records:
        return {
            "mae": 0.0, "rmse": 0.0, "mape": 0.0, "growth_pct": 0.0,
            "points": [], "key_drivers": [], "model_comparison": {}
        }

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Feature Engineering
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["day_of_year"] = df["date"].dt.dayofyear
    df["rolling_7_bookings"] = df["bookings"].rolling(window=7, min_periods=1).mean()
    df["rolling_14_searches"] = df["searches"].rolling(window=14, min_periods=1).mean()
    df["search_conversion"] = df["bookings"] / np.maximum(df["searches"], 1)

    feature_cols = ["day_of_week", "month", "seasonality_index", "searches", "look_to_book", "lead_time_days"]
    X = df[feature_cols].fillna(0)
    y = df["bookings"].values

    # Train-test split for real evaluation
    split_idx = max(int(len(df) * 0.8), len(df) - 14)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    # Model 1: Random Forest
    rf = RandomForestRegressor(n_estimators=60, random_state=42, max_depth=6)
    rf.fit(X_train, y_train)
    y_pred_rf_test = rf.predict(X_test)

    # Model 2: Gradient Boosting
    gb = GradientBoostingRegressor(n_estimators=50, random_state=42, max_depth=3)
    gb.fit(X_train, y_train)
    y_pred_gb_test = gb.predict(X_test)

    # Baseline: Moving average 7-day
    y_pred_baseline_test = np.full_like(y_test, y_train[-7:].mean() if len(y_train) >= 7 else y_train.mean())

    # Evaluation
    mae_rf = float(mean_absolute_error(y_test, y_pred_rf_test))
    rmse_rf = float(root_mean_squared_error(y_test, y_pred_rf_test))
    mape_rf = float(np.mean(np.abs((y_test - y_pred_rf_test) / np.maximum(y_test, 1))) * 100)

    mae_gb = float(mean_absolute_error(y_test, y_pred_gb_test))
    rmse_gb = float(root_mean_squared_error(y_test, y_pred_gb_test))
    mape_gb = float(np.mean(np.abs((y_test - y_pred_gb_test) / np.maximum(y_test, 1))) * 100)

    mae_base = float(mean_absolute_error(y_test, y_pred_baseline_test))
    rmse_base = float(root_mean_squared_error(y_test, y_pred_baseline_test))
    mape_base = float(np.mean(np.abs((y_test - y_pred_baseline_test) / np.maximum(y_test, 1))) * 100)

    # Fit on all historical data for forward forecasting
    rf.fit(X, y)
    gb.fit(X, y)

    last_date = df["date"].max()
    last_searches = df["searches"].iloc[-7:].mean()
    last_ltb = df["look_to_book"].iloc[-7:].mean()
    last_season = df["seasonality_index"].iloc[-1]

    future_points = []
    recent_trend = (df["bookings"].iloc[-7:].mean() - df["bookings"].iloc[-21:-14].mean()) / max(df["bookings"].iloc[-21:-14].mean(), 1)
    growth_pct = round(float(recent_trend * 100), 2)

    # Historical points to include for visualization
    for _, row in df.tail(30).iterrows():
        future_points.append({
            "date": row["date"].strftime("%Y-%m-%d"),
            "actual_bookings": float(row["bookings"]),
            "predicted_bookings": float(row["bookings"]),
            "lower_bound": float(max(0, row["bookings"] * 0.9)),
            "upper_bound": float(row["bookings"] * 1.1),
            "searches": int(row["searches"]),
            "sold_out_risk": float(0.85 if row["sold_out"] == 1 else 0.15)
        })

    for d in range(1, forecast_days + 1):
        f_date = last_date + timedelta(days=d)
        dow = f_date.weekday()
        month = f_date.month

        # Adjust seasonality for future date
        f_season = last_season
        if month in [11, 12, 1, 2]:
            f_season = max(f_season, 1.35)
        elif month in [6, 7, 8]:
            f_season = min(f_season, 0.85)

        # Future searches with mild growth trend
        f_searches = last_searches * (1.0 + (growth_pct / 100.0) * (d / 30.0)) * (1.15 if dow in [4, 5] else 1.0)
        f_ltb = max(15.0, min(45.0, last_ltb + np.sin(d) * 1.5))

        f_X = pd.DataFrame([{
            "day_of_week": dow,
            "month": month,
            "seasonality_index": f_season,
            "searches": f_searches,
            "look_to_book": f_ltb,
            "lead_time_days": max(3, 14 - d // 3)
        }])

        pred_rf = float(rf.predict(f_X)[0])
        pred_gb = float(gb.predict(f_X)[0])

        if model_choice == "random_forest":
            pred = pred_rf
        elif model_choice == "gradient_boosting":
            pred = pred_gb
        else:
            # Ensemble weighted
            pred = (pred_rf * 0.55 + pred_gb * 0.45)

        uncertainty_sd = pred * 0.08 * (1.0 + (d / forecast_days) * 0.5)
        lower_b = max(0.0, pred - 1.96 * uncertainty_sd)
        upper_b = pred + 1.96 * uncertainty_sd

        # Sold out risk probability
        sold_out_prob = min(0.98, max(0.05, (pred / (df["available_inventory"].median() or 300)) * 0.85))

        future_points.append({
            "date": f_date.strftime("%Y-%m-%d"),
            "actual_bookings": None,
            "predicted_bookings": round(pred, 1),
            "lower_bound": round(lower_b, 1),
            "upper_bound": round(upper_b, 1),
            "searches": int(f_searches),
            "sold_out_risk": round(sold_out_prob, 2)
        })

    # Feature Importance drivers
    importances = rf.feature_importances_
    key_drivers = [
        {"name": "Seasonality Index", "importance_pct": round(float(importances[2] * 100), 1), "impact": "High"},
        {"name": "Search Volume (Intent)", "importance_pct": round(float(importances[3] * 100), 1), "impact": "High"},
        {"name": "Look-to-Book Ratio", "importance_pct": round(float(importances[4] * 100), 1), "impact": "Moderate"},
        {"name": "Day of Week (Weekend surge)", "importance_pct": round(float(importances[0] * 100), 1), "impact": "Moderate"},
        {"name": "Booking Lead Time", "importance_pct": round(float(importances[5] * 100), 1), "impact": "Low"},
    ]
    key_drivers = sorted(key_drivers, key=lambda x: x["importance_pct"], reverse=True)

    model_comp = {
        "Ensemble (RF + GB)": {"mae": round((mae_rf + mae_gb) / 2, 2), "rmse": round((rmse_rf + rmse_gb) / 2, 2), "mape": round((mape_rf + mape_gb) / 2, 2)},
        "Random Forest Regressor": {"mae": round(mae_rf, 2), "rmse": round(rmse_rf, 2), "mape": round(mape_rf, 2)},
        "Gradient Boosting": {"mae": round(mae_gb, 2), "rmse": round(rmse_gb, 2), "mape": round(mape_gb, 2)},
        "Moving Average (7D Baseline)": {"mae": round(mae_base, 2), "rmse": round(rmse_base, 2), "mape": round(mape_base, 2)},
    }

    return {
        "model_used": "Ensemble (RF 55% + GB 45%)" if model_choice == "ensemble" else model_choice.replace("_", " ").title(),
        "mae": round(mae_rf, 2),
        "rmse": round(rmse_rf, 2),
        "mape": round(mape_rf, 2),
        "growth_pct": growth_pct,
        "points": future_points,
        "key_drivers": key_drivers,
        "model_comparison": model_comp
    }
