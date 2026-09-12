"""
=============================================================================
PIPELINE ANALISIS SENTIMEN MACHINE LEARNING - MOBILE JKN (PLAY STORE)
Framework: Python, Scikit-Learn, Pandas, Numpy
Algoritma: TF-IDF Vectorizer + Multinomial Naive Bayes & Linear SVM
Cocok untuk Skripsi, Tugas Akhir, Riset Data Mining & NLP Kuliah
=============================================================================
"""

import json
import os
import re
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# 1. Load Dataset
data_path = os.path.join('data', 'mobile_jkn_ml_predicted_5000.json')
print(f"📖 Membaca dataset dari: {data_path}...")

with open(data_path, 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

df = pd.DataFrame(raw_data)
print(f"✅ Total data ulasan: {len(df)} baris\n")

# 2. Text Preprocessing Function
slang_dict = {
    'yg': 'yang', 'dgn': 'dengan', 'utk': 'untuk', 'sdh': 'sudah', 'udh': 'sudah',
    'bgt': 'banget', 'tp': 'tapi', 'sy': 'saya', 'tdk': 'tidak', 'gk': 'tidak',
    'gak': 'tidak', 'ga': 'tidak', 'nggak': 'tidak', 'apk': 'aplikasi', 'eror': 'error',
    'bgus': 'bagus', 'dftr': 'daftar', 'blm': 'belum', 'bener': 'benar', 'trs': 'terus'
}

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'[^\w\s-]', ' ', text)
    text = re.sub(r'(.)\1{2,}', r'\1', text)
    words = [slang_dict.get(w, w) for w in text.split()]
    return " ".join(words)

df['clean_text'] = df['rawText'].apply(clean_text)

# 3. Train-Test Split (80% Train, 20% Test)
X = df['clean_text']
y = df['groundTruth']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✂️ Pembagian Data:")
print(f"   - Data Latih (Training Set) : {len(X_train)} ulasan")
print(f"   - Data Uji   (Testing Set)  : {len(X_test)} ulasan\n")

# 4. TF-IDF Feature Extraction
vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print(f"⚙️ Ekstraksi Fitur TF-IDF:")
print(f"   - Total Fitur Kata/N-gram: {len(vectorizer.get_feature_names_out())} fitur\n")

# 5. Training Model Multinomial Naive Bayes
model = MultinomialNB(alpha=1.0)
model.fit(X_train_vec, y_train)

# 6. Evaluasi Model
y_pred = model.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)

print("=================================================================")
print(f"🎯 HASIL EVALUASI MODEL MULTINOMIAL NAIVE BAYES")
print("=================================================================")
print(f"Akurasi Model : {acc * 100:.2f}%\n")
print("Confusion Matrix:")
labels = ['Positif', 'Netral', 'Negatif']
cm = confusion_matrix(y_test, y_pred, labels=labels)
cm_df = pd.DataFrame(cm, index=[f"Actual {l}" for l in labels], columns=[f"Pred {l}" for l in labels])
print(cm_df)
print("\nLaporan Klasifikasi (Classification Report):")
print(classification_report(y_test, y_pred))
print("=================================================================")

print("\n💡 Skrip Python selesai dijalankan dengan sukses!")
