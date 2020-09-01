import React from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOpt = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 750
      }
    }
  }
}
const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin', 
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin', 
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }
  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height)
  }
}

displayFaceBox = (box) => {
  this.setState({box: box})
}

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }
  onSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://shrouded-shore-78462.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            input: this.state.input
            })
          })
      .then(response => response.json())
      .then(response => {
        if(response){
          fetch('https://shrouded-shore-78462.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }
  onRouteChange = (route) => {
    if(route === 'signin'){
      this.setState(initialState);
    }
    else if(route === 'home')
       this.setState({isSignedIn: true});

    this.setState({route: route});
  }

  render() {
      return (
        <div className="App">
          <Particles className='particles' params={particlesOpt} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn = {this.state.isSignedIn}/>
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank entries={this.state.user.entries} name={this.state.user.name} />
              <ImageLinkForm onInputChange = {this.onInputChange} onSubmit = {this.onSubmit} />
              <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
            </div>
          : (
            this.state.route === 'signin' 
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
          
        }
        </div>
    );
  }
}

export default App;