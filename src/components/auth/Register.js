import React from "react";
import firebase from "../../firebase";
import md5 from "md5";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import "../App.css";

class Register extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isEmailValid(this.state)) {
      error = { message: "Email is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPassStrong(this.state)) {
      error = { message: "Password is weak" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  isPassStrong = ({ password }) => {
    const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return re.test(password);
  };

  isEmailValid = ({ email }) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message.split("Firebase:")[1]}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      try {
        const auth = firebase.auth();
        const createdUser = await firebase.createUserWithEmailAndPassword(
          auth,
          this.state.email,
          this.state.password
        );

        firebase
          .updateProfile(auth.currentUser, {
            displayName: this.state.username,
            photoURL: `https://gravatar.com/avatar/${md5(
              createdUser.user.email
            )}?d=identicon`,
          })
          .then(() => {
            console.log("User is saved");
            this.saveUser(createdUser);
          })
          .catch((err) => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              loading: false,
            });
          });
      } catch (err) {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
          loading: false,
        });
      }
    }
  };

  saveUser = (createdUser) => {
    console.log(createdUser);
    const db = firebase.database.getDatabase();
    firebase.database.set(
      firebase.database.ref(db, "users/" + createdUser.user.uid),
  
      {
        name: createdUser.user.displayName,
        photo: createdUser.user.photoURL,
      }
    );

    this.setState({loading: false});
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render() {
    const { username, email, password, passwordConfirmation, errors, loading } =
      this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                value={username}
                type="text"
              />

              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                className={this.handleInputError(errors, "email")}
                type="email"
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                className={this.handleInputError(errors, "password")}
                type="password"
              />

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                value={passwordConfirmation}
                className={this.handleInputError(errors, "password")}
                type="password"
              />

              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;

// import React, { Component } from "react";
// import firebase from "../../firebase";
// import {
//   Grid,
//   Form,
//   Segment,
//   Button,
//   Header,
//   Message,
//   Icon,
// } from "semantic-ui-react";
// import { Link } from "react-router-dom";
// import "../App.css";

// class Register extends Component {
//   state = {
//     username: "",
//     password: "",
//     email: "",
//     passwordConfirmation: "",
//     errors: [],
//     highlighted: false
//   };

//   handleChange = (e) => {
//     this.setState({ [e.target.name]: e.target.value, errors: [], highlighted: false });
//   };

//   isValid = (state) => {
//     const err = [];
//     let valid = true;

//     if (!this.isEmpty(state)) {
//       err.push({
//         name: "username password password confirmation email",
//         message: "Empty fields are not accepted",
//       });
//       this.setState({ errors: err });
//       valid = false;
//     }

//     if (!this.isPassEqual(state)) {
//       err.push({
//         name: "password password confirmation",
//         message: "Please reconfirm your password",
//       });
//       this.setState({ errors: err });
//       valid = false;
//     }

//     if (!this.isPassStrong(state)) {
//       err.push({ name: "password", message: "Password is weak" });
//       this.setState({ errors: err, highlighted: true });
//       valid = false;
//     }

//     if (!this.isEmailValid(state)) {
//       err.push({ name: "email", message: "Email is invalid" });
//       this.setState({ errors: err });
//       valid = false;
//     }

//     return valid;
//   };

//   isEmpty = ({ username, password, email, passwordConfirmation }) => {
//     if (username && password && passwordConfirmation && email) return true;
//     return false;
//   };

//   isPassEqual = ({ password, passwordConfirmation }) => {
//     if (password === passwordConfirmation) return true;
//     return false;
//   };

// isPassStrong = ({ password }) => {
//   const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
//   return re.test(password);
// };

// isEmailValid = ({ email }) => {
//   const re =
//     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(String(email).toLowerCase());
// };

//   handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!this.isValid(this.state)){
//       this.setState({highlighted: true});
//     }

//     try {
// const auth = firebase.auth();
// const createdUser = await firebase.createUserWithEmailAndPassword(
//   auth,
//   this.state.email,
//   this.state.password
// );

// console.log(createdUser);
//     } catch (err) {
//       this.setState({ errors: [err.message] });
//     }
//   };

//   displayErrors = (errors) => {
//     return errors.map(
//       (err, idx) =>
//         idx === 0 && (
//           <p key={idx} style={{ fontWeight: "bold" }}>
//             {err.message}
//           </p>
//         )
//     );
//   };

//   renderMsg = (errors, key) => {
//     const e = errors.some(err => err.name.includes(key));
//     if(e) return true;
//     return false;
//   }

//   render() {
//     const { username, password, email, passwordConfirmation } = this.state;

//     return (
//       <Grid textAlign="center" verticalAlign="middle" className="app">
//         <Grid.Column style={{ maxWidth: 450 }}>
//           <Header as="h2" icon color="orange" textAlign="center">
//             <Icon name="puzzle piece" color="orange" />
//             Register for DevChat
//           </Header>
//           <Form onSubmit={this.handleSubmit} size="large">
//             <Segment stacked>
//               <Form.Input
//                 fluid
//                 className={`${this.renderMsg(this.state.errors, "username") ? 'error' : null}`}
//                 name="username"
//                 icon="user"
//                 iconPosition="left"
//                 placeholder="Username"
//                 onChange={this.handleChange}
//                 value={username}
//                 type="text"
//               />

//               <Form.Input
//                 fluid
//                 name="email"
//                 icon="mail"
//                 iconPosition="left"
//                 placeholder="Email Address"
//                 onChange={this.handleChange}
//                 value={email}
//                 type="email"
//               />

//               <Form.Input
//                 fluid
//                 name="password"
//                 icon="lock"
//                 iconPosition="left"
//                 placeholder="Password"
//                 onChange={this.handleChange}
//                 value={password}
//                 type="password"
//               />

//               <Form.Input
//                 fluid
//                 name="passwordConfirmation"
//                 icon="repeat"
//                 iconPosition="left"
//                 placeholder="Password Confirmation"
//                 onChange={this.handleChange}
//                 value={passwordConfirmation}
//                 type="password"
//               />

//               <Button color="orange" fluid size="large">
//                 Submit
//               </Button>
//             </Segment>
//           </Form>
//           {this.state.errors.length > 0 && (
//             <Message error> {this.displayErrors(this.state.errors)}</Message>
//           )}
//           <Message>
//             Already a user? <Link to="/login"> Login</Link>
//           </Message>
//         </Grid.Column>
//       </Grid>
//     );
//   }
// }

// export default Register;
