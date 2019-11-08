import { Button, Icon, Breadcrumb  } from 'antd';
import * as React from 'react';
import {useState}  from 'react';
import PropTypes from "prop-types";
import SpeechRecognition from 'react-speech-recognition';
import * as _ from "lodash";
import {Animated} from "react-animated-css";
import * as bot from "../../../assets/bot.gif";
import * as homeLogo from "../../../assets/home-logo.gif";
import axios from 'axios';
import { sha512 } from 'js-sha512';

type HomepageProps = {
  classNames: any;
  image: string;
  transcript: PropTypes.string;
  resetTranscript: PropTypes.func;
  browserSupportsSpeechRecognition: PropTypes.bool;
};

function Homepage(props: HomepageProps) {

  const [listening, setListening] = useState(false);

  const [streaming, setStreaming] = useState(false);

  const [muted, muteBot] = useState(false);
  
  const [transcript, setTranscript] = useState('');

  const [hash, setHash] = useState('');

  const [botTranscript, setBotTranscript] = useState('How may I help you?');

  const [page, setPage] = useState('');

  const [product, setProduct] = useState({});

  const [payload, setPayload] = useState([]);

  const synth = window.speechSynthesis;

  if (!props.browserSupportsSpeechRecognition) {
    return null;
  }

  props.recognition.onresult = (event:any) => {
    let result = _.last(event.results);
    if(result.isFinal && !muted){
      let transcriptData = result[0].transcript;
      transcriptData = _.trim(transcriptData)
      setTranscript(transcriptData);
      if(!_.includes(['view more', 'check out', 'checkout', 'buy now'], transcriptData)){
        getBotResponse(transcriptData)
      }else{
        if(transcriptData === 'view more'){
          setPage('description');
        }
        if(transcriptData === 'checkout' || transcriptData === 'check out'){
          setPage('checkout');
        }
        if(transcriptData === 'buy now'){
          setPage('checkout');
        }
      }
    }
  }

  function getBotResponse(message:any){
    if(!synth.speaking){
      axios({
        url: `http://localhost:8000/api/bot?message=${message}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(function(res){
        let data = res.data;
        setBotTranscript(data.botResponse.fulfillment_text);
        synth.cancel();
        const utterThis = new SpeechSynthesisUtterance(data.botResponse.fulfillment_text);
        synth.speak(utterThis);
        setPayload(data.payload);
        setTimeout(() => setPayload(data.payload) ,1000);
        setPage('list');
        if(data.payload.length > 0){
          muteBot(true)
          synth.cancel();
        }
      });
    }
  }

  function startToClick(){
    if(!props.listening){
      props.startListening();
      setListening(true);
      setBotTranscript('Hi, I am Astra!, How may I help you?');
      const utterThis = new SpeechSynthesisUtterance("Hi, I am Astra!, How may I help you?");
      synth.speak(utterThis);
    }else{
      props.stopListening();
      setListening(false);
      setTranscript('');
      setBotTranscript('');
    }
  }

  function buyProduct(){
    var hash = makeHash();
    setHash(hash)
    setPage('checkout');
  }

  function makeHash(){
    var salt = "gC1ET1K4y1";
    var txnid = "123";
    var amount = product.price;
    var productinfo = product.name;
    var firstname = "Saurav";
    var email = "sanspoly@gmail.com";
    var payhash_str = "hHKX1oI8|"+checkNull(txnid)+"|"+checkNull(amount)+"|"+checkNull(productinfo)+"|"+checkNull(firstname)+'|'+checkNull(email)+'|||||||||||'+salt;
    var hashCode = sha512(payhash_str).toLowerCase();
    return hashCode;
  }

  function checkNull(value:any){
    if (value == null) {
        return '';
    } else {
        return value;
    }
  }

  function setDescriptionPage(page, product){
    setProduct(product);
    setPage(page);
  }

  function startVideo(){
    
  }

  function payNow(){
    var payuForm = document.forms.clientPaymentForm;
    payuForm.submit();
  }

  return (
    <div className={props.classNames.homepage}>
      <div className='container-fluid'>
        {!listening &&  
          <div className='row bottom-padded-row'>
            <div className="col-lg-12">
              <div className="center astra-container">
                <img src={homeLogo}/>
                <div className="astra-welcome-text">
                  <p>Astra Bot</p>
                  <small>A virtual talking shopping assistant</small>
                </div>
              </div>
            </div>
          </div>
        }
        {listening &&  
          <div className='row bottom-padded-row'>
            <div className="col-lg-3">
              <Animated animateOnMount={false} animationIn="fadeIn" animationOut="fadeOut" isVisible={listening}>
                <div className="astra-bot-container">
                  <div className="astra-bot-image">
                    <img src={bot}/>
                  </div>
                  <div className="bot-transcript">
                    {botTranscript != '' &&
                      <p>Astra: {botTranscript}</p>
                    }
                  </div>
                  <div className="user-transcript">
                    {transcript != '' &&
                      <p>You: {transcript}</p>
                    }
                  </div>
                </div>
              </Animated>
            </div>
            <div className="col-lg-9">
              {payload.length == 0 &&
                <div className="center astra-container">
                  <img src={homeLogo}/>
                  <div className="astra-welcome-text">
                    <p>Astra Bot</p>
                    <small>A virtual talking shopping assistant</small>
                  </div>
                </div>
              }
              {payload.length != 0 &&
                <div className="center astra-container container">
                  {page === 'list' && 
                  <div>
                    <div className="row">
                      <div className="col-lg-12">
                        <Breadcrumb>
                          <Breadcrumb.Item>Products</Breadcrumb.Item>
                        </Breadcrumb>
                      </div>
                    </div>
                    <div className="row">
                      {payload && payload.map((product, index) => {
                        return <div key={index} onClick={() => setDescriptionPage('description', product)} className="col-lg-4 astra-product-list">
                          <div className="astra-product-contain">
                            <div className="astra-product-image">
                              <img src={"http://localhost:8000/media/"+product.image}/>
                            </div>
                            <div className="astra-product-description">
                              <p>{product.name}</p>
                              <small>{product.description}</small>
                              <p className="astra-price-text">₹ {product.price}</p>
                            </div>
                            <div className="astra-product-control">
                              <Button onClick={buyProduct}>Buy Now</Button>
                            </div>
                          </div>
                        </div>
                      })}
                    </div>
                  </div>
                  }
                  {page === 'description' && 
                    <div>
                      <div className="row">
                        <div className="col-lg-12">
                          <Breadcrumb>
                            <Breadcrumb.Item>Products</Breadcrumb.Item>
                            <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
                          </Breadcrumb>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-12 astra-product-detail">
                          <div className="row">
                            <div className="col-lg-4">
                              <div className="astra-product-image">
                                <img src={"http://localhost:8000/media/"+product.image}/>
                              </div>
                            </div>
                            <div className="col-lg-8">
                              <div className="astra-product-description">
                                <p>{product.name}</p>
                                <small>{product.description}</small>
                                <p className="astra-price-text">₹ {product.price}</p>
                              </div>
                              <div className="astra-product-description">
                                <small><p>Brand: {product.brand}</p></small>
                                <small><p>Color: {product.color}</p></small>
                                <small><p>Ram: {product.ram}</p></small>
                                <small><p>Memory Capacity: {product.memory_capacity}</p></small>
                                <small><p>Memory Type: {product.memory_type}</p></small>
                              </div>
                              <div className="astra-product-control">
                                <Button onClick={buyProduct}>Buy Now</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  {page === 'checkout' && 
                    <div>
                      <div className="row">
                        <div className="col-lg-12">
                          <Breadcrumb>
                            <Breadcrumb.Item>Products</Breadcrumb.Item>
                            <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
                            <Breadcrumb.Item>Checkout</Breadcrumb.Item>
                          </Breadcrumb>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-12 astra-product-detail">
                          <div className="row">
                            <div className="col-lg-4">
                              <div className="astra-product-image">
                                <img src={"http://localhost:8000/media/"+product.image}/>
                              </div>
                            </div>
                            <div className="col-lg-8">
                              <div className="astra-product-description">
                                <p>{product.name}</p>
                                <small>{product.description}</small>
                                <p className="astra-price-text">₹ {product.price}</p>
                              </div>
                              <div className="astra-product-description">
                                <small><p>Brand: {product.brand}</p></small>
                                <small><p>Color: {product.color}</p></small>
                                <small><p>Ram: {product.ram}</p></small>
                                <small><p>Memory Capacity: {product.memory_capacity}</p></small>
                                <small><p>Memory Type: {product.memory_type}</p></small>
                              </div>
                              <div className="astra-product-control">
                                  <form name="clientPaymentForm" id="clientPaymentForm" action="https://test.payu.in/_payment" method="post">
                                    <input type="hidden" name="key" value="hHKX1oI8"/>
                                    <input type="hidden" name="txnid" value="123"/>
                                    <input type="hidden" name="amount" value={product.price}/>
                                    <input type="hidden" name="firstname" value="Saurav"/>
                                    <input type="hidden" name="email" value="sanspoly@gmail.com"/>
                                    <input type="hidden" name="phone" value="8144876041"/>
                                    <input type="hidden" name="productinfo" value={product.name}/>
                                    <input type="hidden" name="surl" value="http://localhost:3000/success"/>
                                    <input type="hidden" name="furl" value="http://localhost:3000?reload=true"/>
                                    <input type="hidden" name="service_provider" value="payu_paisa"/>
                                    <input type="hidden" name="hash" value={hash}/>
                                    <input type="hidden" name="lastname" value="Suman"/>
                                    <input type="hidden" name="address1" value="#125/38, CKS Tower, 19th Cross, 16th Main, "/>
                                    <input type="hidden" name="address2" value="BTM Stage 2"/>
                                    <input type="hidden" name="city" value="Bangalore"/>
                                    <input type="hidden" name="state" value="Karnataka"/>
                                    <input type="hidden" name="country" value="India"/>
                                    <input type="hidden" name="zipcode" value="560075"/>
                                    <input type="button" value="Pay" className="astra-pay ant-btn" onClick={payNow}/>
                                  </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
        <div className='astra-listen-control'>
          <Button className={streaming ? 'active' : ''} onClick={startVideo}>
            <Icon type="youtube"/>
          </Button>
          <Button className={listening ? 'active' : ''} onClick={startToClick}>
            <Icon type="customer-service"/>
          </Button>
        </div>
      </div>
    </div>
  );
}

const options = {
  autoStart: false
}

export default SpeechRecognition(options)(Homepage);

