# -*- coding: utf-8 -*-
import nltk
import sys
import time
from io import open
 
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
 
text = sys.argv[1]
stop_words = set(stopwords.words('keywords'))
words = word_tokenize(text)
 
new_sentence = []
 
for word in words:
    if word in stop_words:
        new_sentence.append(word)
 
print(new_sentence)
sys.stdout.flush()