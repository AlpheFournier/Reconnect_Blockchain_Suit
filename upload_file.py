import requests

base_url = 'http://dev.reconnect.fr:8080/'

def get_token():
	url =  base_url + 'oauth/v2/token'
	params = {
	    'grant_type': 'client_credentials',
	    'client_id': '2_1qoaz4ssy2o00koowcgk4koog8skc4k8084kgs48c4k8o8wggc',
	    'client_secret': 'jrf5rjixpogw008wk4wogks80kockw044cwgw084cgwgosw4g'
	}
	r = requests.get(url, params=params)
	return r.json()['access_token']

def upload_file(idRosalie, file):
	url = base_url + 'appli/rosalie/beneficiaire/1/uploadFile'
	token = get_token()
	params = {
		'access_token': token,
		'idRosalie': idRosalie
	}
	open_file = open(file, 'rb')
	files = {	
	    'file': open_file
	}
	r = requests.post(url, params=params, files=files)
	open_file.close()
	print(r.json())

upload_file(1,'Placeholder.pdf')