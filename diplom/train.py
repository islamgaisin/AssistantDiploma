import pandas as pd
from langchain import HuggingFaceHub
from langchain.prompts import ChatPromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DataFrameLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser

def load_data():
    dataset = pd.read_json('diplom/dataset/data.json')
    loader = DataFrameLoader(dataset, page_content_column='Question')
    return loader.load()

def create_database():
    docs = load_data()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    splitted_docs = splitter.split_documents(docs)
    embeddings = HuggingFaceEmbeddings()
    database = FAISS.from_documents(splitted_docs, embeddings)
    database.as_retriever()
    database.save_local("local_faiss_database")
    return database

def build_chain():
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Ты являешься инструментом-помощником для изучения языка программирования Python. Все ответы должны соответствовать правилам этого языка."),
        ("user", "{input}")
    ])
    llm=HuggingFaceHub(repo_id='IlyaGusev/fred_t5_ru_turbo_alpaca',
                       huggingfacehub_api_token="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",
                       model_kwargs={'temperature': 0, 'max_length': 128}
                    )
    str_output_parser = StrOutputParser()
    chain = prompt | llm.with_config({"run_name": "ru_alpaca_model"}) | str_output_parser.with_config({"run_name": "parser"})
    return chain
