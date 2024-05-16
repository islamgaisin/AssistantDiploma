import numpy as np
import pandas as pd
import json

def parse():
    data = pd.read_excel('raw_data.xlsx')
    data['id'] = np.arange(1, data.shape[0] + 1)
    data = data.iloc[:, [2, 0, 1]]
    data.to_json('data.json', orient='records', force_ascii=False)


if __name__ == '__main__':
    parse()
