# api_analytics.py
from flask import Blueprint, request, jsonify
import json

# 1. Bikin "Lemari"-nya
analytics_bp = Blueprint('analytics_bp', __name__)

# 2. "Pintu" (Ganti @app.route jadi @analytics_bp.route)
@analytics_bp.route('/analytics/save', methods=['POST'])
def save_analytics():
    # ... (Semua kode 'save_analytics' Abang, GAK BERUBAH) ...
    data = request.json
    raw_heatmap_data = data.get('rawHeatmap')
    if raw_heatmap_data:
        data['processedHeatmapGrid'] = calculate_heatmap_grid(raw_heatmap_data)
        data['processedHandDominance'] = calculate_hand_dominance(raw_heatmap_data)
    
    return jsonify({"status": "sukses", "message": "Data analisis diterima"}), 200

# 3. "Rumus" (Pindah ke sini)
def calculate_heatmap_grid(raw_heatmap, num_cols=4, num_rows=4):
    # ... (Semua kode 'calculate_heatmap_grid' Abang, GAK BERUBAH) ...
    grid_counts = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    for point in raw_heatmap:
        x, y = point.get('x', 0), point.get('y', 0)
        col_index = min(int(x * num_cols), num_cols - 1)
        row_index = min(int(y * num_rows), num_rows - 1)
        grid_counts[row_index][col_index] += 1
    
    all_counts = [count for row in grid_counts for count in row]
    min_count, max_count = min(all_counts), max(all_counts)
    if max_count == min_count:
        return [[50 for _ in range(num_cols)] for _ in range(num_rows)]
        
    grid_scores = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    for r in range(num_rows):
        for c in range(num_cols):
            score = ((grid_counts[r][c] - min_count) / (max_count - min_count)) * 100
            grid_scores[r][c] = round(score, 1)
    return grid_scores

def calculate_hand_dominance(raw_heatmap):
    # ... (Semua kode 'calculate_hand_dominance' Abang, GAK BERUBAH) ...
    left_count = sum(1 for p in raw_heatmap if p.get('hand') == 'Left')
    right_count = sum(1 for p in raw_heatmap if p.get('hand') == 'Right')
    total = left_count + right_count
    if total == 0:
        return {"left_percent": 0, "right_percent": 0}
    
    left_percent = round((left_count / total) * 100, 1)
    right_percent = round((right_count / total) * 100, 1)
    return {"left_percent": left_percent, "right_percent": right_percent}