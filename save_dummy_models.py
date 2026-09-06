from transformers import AutoTokenizer, AutoModelForSequenceClassification
import gc

print("Saving clause_classifier...")
c_tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
c_model = AutoModelForSequenceClassification.from_pretrained("nlpaueb/legal-bert-base-uncased", num_labels=3, ignore_mismatched_sizes=True)
c_model.save_pretrained("models/saved/clause_classifier")
c_tokenizer.save_pretrained("models/saved/clause_classifier")
del c_model
del c_tokenizer
gc.collect()

print("Saving legality_classifier...")
l_tokenizer = AutoTokenizer.from_pretrained("roberta-base")
l_model = AutoModelForSequenceClassification.from_pretrained("roberta-base", num_labels=2, ignore_mismatched_sizes=True)
l_model.save_pretrained("models/saved/legality_classifier")
l_tokenizer.save_pretrained("models/saved/legality_classifier")
print("Done!")
