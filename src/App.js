import React, {Component} from 'react';
import './App.css';
import Grid from "@material-ui/core/Grid/Grid";
import Button from "@material-ui/core/Button/Button";
import {DialogTitle, List, withStyles} from "@material-ui/core"

import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import TextField from "@material-ui/core/TextField/TextField";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import ListItem from "@material-ui/core/es/ListItem/ListItem";


class App extends Component {

    styles = theme => ({
    });

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            openJson: true,
            json: null,
            jsonLoaded: false,
            users: [],
            userContext: {
                user: null,
                document: false
            },
            result: false

        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    uniq = (a) => {
        return Array.from(new Set(a));
    };

    extract_users = () => {
        let users = this.state.json.accepting.flatMap((accept) => accept.users.map((u) => u.user));
        return this.uniq(users);
    };


    prev_steps_ok = (user) => {
        let state_index = null;
        let i = 0;
        for (let match of this.state.json.accepting) {
            if (match.users.some((u) => u.user === user && u.result === null)) {
                state_index = i;
                break;
            }
            i++;
        }
        if (state_index === null)
            return false;
        i = 0;
        for (let match of this.state.json.accepting) {
            if (match.users.some((u) => u.result === null) && i < state_index)
                return false;
            i++;
        }
        return true;
    };


    checkAccepting = (accepting) => {
        if (accepting.condition === "or") {
            return accepting.users.some((elem) => elem.result === true);
        }
        if (accepting.condition === "and") {
            return accepting.users.every((elem) => elem.result === true);
        } else {
            return accepting.users.every((elem) => elem.result === true);
        }
    };

    handleClickOpen = (user) => {
        const ok = this.prev_steps_ok(user);
        for (let elem of this.state.json.accepting) {
            let u = elem.users.find((elem) => elem.user === user);
            if (u) {
                if (u.result !== null) continue;
                else {
                    if (ok) {
                        this.setState({
                            open: true,
                            userContext: {
                                user: user,
                                document: true,
                            }
                        });
                        return;
                    }
                }
            }
        }

        this.setState({
            open: true,
            userContext: {
                user: user,
                document: false,
            }
        });
        //     if (u) {
        //         if (u.result !== null) {
        //             this.setState({
        //                 open: true,
        //                 userContext: {
        //                     user: user,
        //                     document: false
        //                 }
        //             });
        //         } else if (u.result !== null && elem.result !== null) continue;
        //         else {
        //             this.setState({
        //                 open: true,
        //                 userContext: {
        //                     user: user,
        //                     document: true
        //                 }
        //             });
        //         }
        //         return;
        //     }
        // }
        // this.setState({
        //     open: true,
        //     userContext: {
        //         user: user,
        //         document: false,
        //     }
        // });
    };

    onChange = (e) => {
        this.setState({
            json: JSON.parse(e.target.value)
        });
    };

    loadJSON = () => {
        this.setState({
            jsonLoaded: true
        });
    };

    onOpenJson = () => {
        this.setState((state) => {
            return {
                ...state,
                openJson: !state.openJson
            }
        });
    };

    answerUser = (answer) => {
        for (let elem of this.state.json.accepting) {
            let u = elem.users.find((elem) => elem.user === this.state.userContext.user && elem.result === null);
            if (u) {
                u.result = answer === "accept";
                break;
            }
        }
        this.procTest();
        this.handleClose();
    };

    handleClose = () => {
        this.setState({open: false});
    };
    handleCloseResult = () => {
        this.setState({result: false});
    };

    procTest = () => {
        let fail = false;
        for (let elem of this.state.json.accepting) {
            if (elem.condition === "or") {
                let u = elem.users.some((elem) => elem.result === true);
                if (!u) {
                    fail = true;
                    elem.result = false;
                } else {
                    elem.result = true;
                }
                continue;
            }
            if (elem.condition === "and") {
                let u = elem.users.every((elem) => elem.result === true);
                if (!u) {
                    fail = true;
                    elem.result = false;
                } else {
                    elem.result = true;
                }
            } else {
                let u = elem.users.every((elem) => elem.result === true);
                if (!u) {
                    fail = true;
                    elem.result = false;
                } else {
                    elem.result = true;
                }
            }
        }
        return fail;
    };

    doneTest = () => {
        let fail = this.procTest();
        if (fail) {
            this.state.json.result = false;
        } else {
            this.state.json.result = true;
        }
        this.setState({
            result: true,
        });
    };

    render() {
        const {classes} = this.props;

        return (
            <Grid
            >
                {
                    this.state.jsonLoaded ?
                        (
                            <Grid
                            >

                                <div>
                                    <div>

                                        <h3>{this.state.json.document}</h3>
                                        <Button onClick={() => this.doneTest()}>
                                            Результат
                                        </Button>
                                        <h2>Список пользователей</h2>
                                    </div>

                                    <List component="nav" className={classes.root}>
                                        {
                                            this.extract_users().map((user) =>
                                                (
                                                    <Button
                                                            className={classes.button}
                                                            onClick={() => {
                                                                this.handleClickOpen(user)
                                                            }}>
                                                        {user}
                                                    </Button>
                                                )
                                            )
                                        }
                                    </List>


                                    <Dialog
                                        open={this.state.open}
                                        onClose={this.handleClose} prev_steps_ok
                                        style={{backgroundColor: "#000"}}
                                    >
                                        {this.state.userContext.document ? (<DialogTitle
                                                id="alert-dialog-title">{"User: " + this.state.userContext.user}
                                            </DialogTitle>) :
                                            (<DialogContent>
                                                Нет документов на рассмотрение
                                            </DialogContent>)}
                                        {this.state.userContext.document ? (
                                            <DialogActions>
                                                <Button onClick={() => this.answerUser("reject")}>
                                                    Отклонить
                                                </Button>
                                                <Button onClick={() => this.answerUser("accept")}>
                                                    Принять
                                                </Button>
                                            </DialogActions>) : (
                                            <ListItem onClick={this.handleClose}>
                                            </ListItem>
                                        )
                                        }
                                    </Dialog>
                                    <Dialog
                                        style={{backgroundColor: "#000"}}
                                        onClose={() => this.handleCloseResult()}
                                        open={this.state.result}>
                                        <DialogContent>
                                            <DialogContentText>
                                                <h4>
                                                    {
                                                        this.state.json.result ?
                                                            "Документ принят" : "Документ отклонен"
                                                    }
                                                </h4>
                                            </DialogContentText>
                                            <TextField
                                                value={JSON.stringify(this.state.json, null, 3)}
                                                multiline={true}

                                                id="name"

                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => this.handleCloseResult()}>
                                                Закрыть
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                            </Grid>
                        )
                        :
                        (
                            <div>
                                <Dialog
                                    style={{backgroundColor: "#000"}}

                                    open={this.state.openJson}>
                                    <DialogContent>
                                        <DialogContentText>
                                           JSON
                                        </DialogContentText>
                                        <TextField
                                            value={this.state.text} onChange={this.onChange}
                                            multiline={true}
                                            id="name"
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        
                                        <Button onClick={this.loadJSON}>
                                            Загрузить
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        )
                }
            </Grid>
        );
    }
}

export default withStyles(App.styles)(App);