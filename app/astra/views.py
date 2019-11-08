import json
import string 
import random 
import dialogflow
import os
import requests
import cv2
from google.protobuf.json_format import MessageToJson
from django.shortcuts import render
from django.http import HttpResponse
from django.forms.models import model_to_dict
from astra.models import Category, SubCategory, Product, Order

unique = random.randint(0, 10)

# Create your views here.
def get_product(request): 
    if request.method == 'GET': 
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Product fetched successfully'
        Products = Product.objects.all().values()  
        response_data['data'] = list(Products)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    
def get_product_by_id(request, product_id): 
    if request.method == 'GET': 
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Product detail fetched successfully'
        product = Product.objects.filter(pk = product_id).values() 
        response_data['data'] = product[0]
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    
def create_order(request):
    if request.method == 'POST':
        order = request.POST
        new_order = Order(order_number=order['order_number'], \
                                    product=order['product'], \
                                    quantity=order['quantity'], \
                                    unit_price=order['unit_price'])
        new_order.save()
        return HttpResponse({ 'success' : True, 'errors' : {}})
        
def get_order(request): 
    if request.method == 'GET': 
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Order fetched successfully'
        Orders = Order.objects.all().values()  
        response_data['data'] = list(Orders)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    
def get_order_by_id(request, order_id): 
    if request.method == 'GET': 
        response_data = {}
        response_data['result'] = 'success'
        response_data['message'] = 'Order detail fetched successfully'
        order = Order.objects.filter(pk = order_id).values() 
        response_data['data'] = list(order)
        return HttpResponse(response_data, content_type="application/json") 
    
def send_message(request):
    if request.method == 'GET': 
        message = request.GET['message']
        project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
        query_text, display_name, intent_detection_confidence, fulfillment_text, \
        parameters, all_required_params_present = detect_intent_texts(project_id, unique, message, 'en')
        payload = []
        if all_required_params_present is True and parameters != {}:
            payload = search_product(parameters, display_name)
        response_data = {}
        response_data['result'] = 'success'
        response_data['payload'] = payload
        response_data['botResponse'] = {}
        response_data['botResponse']['query_text'] = query_text
        response_data['botResponse']['display_name'] = display_name
        response_data['botResponse']['intent_detection_confidence'] = intent_detection_confidence
        response_data['botResponse']['fulfillment_text'] = fulfillment_text
        response_data['botResponse']['parameters'] = parameters
        response_data['botResponse']['all_required_params_present'] = all_required_params_present
        return HttpResponse(json.dumps(response_data), content_type="application/json")

def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)

    if text:
        text_input = dialogflow.types.TextInput(
            text=text, language_code=language_code)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(
            session=session, query_input=query_input)
        parameters = json.loads(MessageToJson(response.query_result.parameters))
        return response.query_result.query_text, response.query_result.intent.display_name, \
                response.query_result.intent_detection_confidence, response.query_result.fulfillment_text, \
                parameters, response.query_result.all_required_params_present
                
def search_product(parameters, name):
    category_name = ''
    if name == 'order.laptop':
        category_name = 'laptop'
    if name == 'order.mobile':
        category_name = 'mobile'
    if category_name == 'laptop':
        color = parameters["color"]
        brand = parameters["brand"]
        memory_capacity = parameters["memory_capacity"]
        memory_type = parameters["memory_type"]
        ram = parameters["ram"]
        price_range = parameters["price_range"]
        price = 100000
        if price_range == 'less than 15k':
            price = 15000
        if price_range == 'less than 20k':
            price = 20000
        if price_range == 'less than 30k':
            price = 30000
        if price_range == 'less than 40k':
            price = 40000
        if price_range == 'less than 50k':
            price = 50000
        products = Product.objects.filter(subcategory__name__iexact = category_name, color__iexact = color, brand__iexact = brand, \
                                            memory_capacity__iexact = memory_capacity, memory_type__iexact = memory_type, \
                                            ram__iexact = ram, price__lte = price).values() 
    if category_name == 'mobile':
        color = parameters["color"]
        brand = parameters["brand"]
        ram = parameters["ram"]
        price_range = parameters["price_range"]
        price = 100000
        if price_range == 'less than 15k':
            price = 15000
        if price_range == 'less than 20k':
            price = 20000
        if price_range == 'less than 30k':
            price = 30000
        if price_range == 'less than 40k':
            price = 40000
        if price_range == 'less than 50k':
            price = 50000
        category_name = 'mobiles'
        products = Product.objects.filter(subcategory__name__iexact = category_name, color__iexact = color, brand__iexact = brand, \
                                            ram__iexact = ram, price__lte = price).values() 
    payload = list(products)
    return payload

def send_stream(request):
    if request.method == 'GET': 
        cap = cv2.VideoCapture(0)  # Change only if you have more than one webcams
        image_template = cv2.imread('media/images/laptop.jpg', 0) 
        while True:
            ret, frame = cap.read()
            # Get height and width of webcam frame
            height, width = frame.shape[:2]

            # Define ROI Box Dimensions
            top_left_x = int (width / 3)
            top_left_y = int ((height / 2) + (height / 4))
            bottom_right_x = int ((width / 3) * 2)
            bottom_right_y = int ((height / 2) - (height / 4))

            # Draw rectangular window for our region of interest   
            cv2.rectangle(frame, (top_left_x,top_left_y), (bottom_right_x,bottom_right_y), 255, 3)

            # Crop window of observation we defined above
            cropped = frame[bottom_right_y:top_left_y , top_left_x:bottom_right_x]

            # Flip frame orientation horizontally
            frame = cv2.flip(frame,1)

            # Get number of SIFT matches
            matches = sift_detector(cropped, image_template)

            # Display status string showing the current no. of matches 
            cv2.putText(frame,str(matches),(450,450), cv2.FONT_HERSHEY_COMPLEX, 2,(0,255,0),1)

            # Our threshold to indicate object deteciton
            # We use 10 since the SIFT detector returns little false positves
            threshold = 10

            # If matches exceed our threshold then object has been detected
            if matches > threshold:
                cv2.rectangle(frame, (top_left_x,top_left_y), (bottom_right_x,bottom_right_y), (0,255,0), 3)
                cv2.putText(frame,'Object Found',(50,50), cv2.FONT_HERSHEY_COMPLEX, 2 ,(0,255,0), 2)
            cv2.imshow('Object Detector using SIFT', frame)
            if cv2.waitKey(1) == 13: #13 is the Enter Key
                break
        cap.release()
        cv2.destroyAllWindows()
        response_data = {}
        response_data['result'] = 'success'
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    
def sift_detector(new_image, image_template):
    # Function that compares input image to template
    # It then returns the number of SIFT matches between them
    image1 = cv2.cvtColor(new_image, cv2.COLOR_BGR2GRAY)
    image2 = image_template

    # Create SIFT detector object
    #sift = cv2.SIFT()
    sift = cv2.xfeatures2d.SIFT_create()
    # Obtain the keypoints and descriptors using SIFT
    keypoints_1, descriptors_1 = sift.detectAndCompute(image1, None)
    keypoints_2, descriptors_2 = sift.detectAndCompute(image2, None)

    # Define parameters for our Flann Matcher
    FLANN_INDEX_KDTREE = 0
    index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 3)
    search_params = dict(checks = 100)

    # Create the Flann Matcher object
    flann = cv2.FlannBasedMatcher(index_params, search_params)

    # Obtain matches using K-Nearest Neighbor Method
    # the result 'matchs' is the number of similar matches found in both images
    matches = flann.knnMatch(descriptors_1, descriptors_2, k=2)

    # Store good matches using Lowe's ratio test
    good_matches = []
    for m,n in matches:
        if m.distance < 0.7 * n.distance:
            good_matches.append(m) 
    return len(good_matches)