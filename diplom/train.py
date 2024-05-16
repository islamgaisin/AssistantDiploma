import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DataFrameLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

dataset = pd.read_json('dataset/data.json')
loader = DataFrameLoader(dataset, page_content_column='Question')
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
splitted_docs = splitter.split_documents(docs)
embeddings = HuggingFaceEmbeddings()
database = FAISS.from_documents()