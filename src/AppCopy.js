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
import Ico from "@material-ui/icons/ArrowDropDownCircle"
import "./style.css"


class App extends Component {

    styles = theme => ({
        root: {
            width: '100%',


        },
        elem: {
            backgroundColor: "red"
        },
        button: {
            margin: theme.spacing.unit,
        },
        root1: {
            flexGrow: 1,
        },
    });

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            openJson: true,
            json: null,
            jsonLoaded: false,
            userContext: {
                user: null,
                document: false
            },
            result: false

        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }


    prev_steps_ok = (user) => {
        let state_index = null;
        let i = 0;
        for (let match of this.state.json.accepting) {
            if (match.users.some((u) => u.user === user)) {
                state_index = i;
                break;
            }
            i++;
        }
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
        for (let elem of this.state.json.accepting) {
            let u = elem.users.find((elem) => elem.user === user);
            if (u) {
                if (u.result !== null) {
                    this.setState({
                        open: true,
                        userContext: {
                            user: user,
                            document: false
                        }
                    });
                } else {
                    this.setState({
                        open: true,
                        userContext: {
                            user: user,
                            document: true
                        }
                    });
                }
                return;
            }
        }
        this.setState({
            open: true,
            userContext: {
                user: user,
                document: false,
            }
        });
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
            let u = elem.users.find((elem) => elem.user === this.state.userContext.user);
            if (u)
                u.result = answer === "accept";
        }
        this.handleClose();
    };

    handleClose = () => {
        this.setState({open: false});
    };
    handleCloseResult = () => {
        this.setState({result: false});
    };

    doneTest = () => {
        let fail = false;
        for (let elem of this.state.json.accepting) {
            if (elem.condition === "or") {
                let u = elem.users.some((elem) => elem.result === true);
                if (!u){
                    fail = true;
                    elem.result = false;
                }else{
                    elem.result = true;
                }
                continue;
            }
            if (elem.condition === "and") {
                let u = elem.users.every((elem) => elem.result === true);
                if (!u){
                    fail = true;
                    elem.result = false;
                }else{
                    elem.result = true;
                }
            } else {
                let u = elem.users.every((elem) => elem.result === true);
                if (!u){
                    fail = true;
                    elem.result = false;
                }else{
                    elem.result = true;
                }
            }
        }
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
                container
                direction="row"
                justify="center"
                alignItems="center"

            >

                {
                    this.state.jsonLoaded ?
                        (
                            <Grid
                                container
                                direction="row"

                                alignItems="left"
                            >

                            <div>
                                <div style={{display: "-webkit-inline-box"}}>
                                    <h2>Список пользователей</h2>
                                    <Button onClick={() => this.doneTest()} style={{margin: '23%'}}>
                                        <Ico/>
                                    </Button>
                                </div>

                                <List component="nav" className={classes.root}>
                                    {
                                        this.state.json.accepting.map((accepting) => {
                                            return accepting.users.map((user) =>
                                                 (
                                                    <ListItem
                                                            onClick={() => {
                                                                this.handleClickOpen(user.user)
                                                            }}
                                                            style={{margin: '2%'}}>
                                                        {user.user}
                                                    </ListItem>
                                                )
                                            )
                                        })
                                    }
                                </List>


                                <Dialog style={{ backgroundColor: 'black'}}
                                    open={this.state.open}
                                    onClose={this.handleClose}prev_steps_ok
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    {this.state.userContext.document ? (<DialogTitle
                                            id="alert-dialog-title">{this.state.json.document + " " + this.state.userContext.user}
                                        </DialogTitle>) :
                                        (<DialogContent>
                                           Нет документов на рассмотрение
                                        </DialogContent>)}
                                    {this.state.userContext.document && this.prev_steps_ok(this.state.userContext.user) ? (<DialogActions>
                                        <Button onClick={() => this.answerUser("reject")} >
                                            Отклонить
                                        </Button>
                                        <Button onClick={() => this.answerUser("accept")} autoFocus>
                                            Подписать
                                        </Button>
                                    </DialogActions>) : (
                                        <Button onClick={this.handleClose}>
                                            Просмотр документа недоступен
                                        </Button>
                                    )
                                    }
                                </Dialog>
                                <Dialog style={{ backgroundColor: 'black', width: '500px!important'}}
                                    fullWidth={true}
                                    maxWidth={'lg'}
                                    onClose={() => this.handleCloseResult()}
                                    open={this.state.result}
                                    aria-labelledby="form-dialog-title">
                                    <DialogContent>
                                        <DialogContentText>
                                            <h3>
                                            {
                                                this.state.json.result ?
                                                    "ПРИНЯТО" : "ОТКЛОНЕНО"
                                            }
                                            </h3>
                                        </DialogContentText>
                                        <TextField
                                            value={JSON.stringify(this.state.json, null, 3)}
                                            multiline={true}
                                            rows={30}
                                            autoFocus
                                            margin="dense"
                                            id="name"
                                            fullWidth
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => this.handleCloseResult()}>
                                            Отмена
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                            </Grid>
                        )
                        :
                        (
                            <div style={{width: '500px!important'}}>
                                {/*<Button style={{marginTop: 400}} onClick={this.onOpenJson}>*/}
                                    {/*Выгрузить текстовый файл*/}
                                {/*</Button>*/}
                                <Dialog
                                    style={{ backgroundColor: 'black', width: '500px!important'}}
                                    open={this.state.openJson}
                                    aria-labelledby="form-dialog-title"
                                    fullWidth>
                                    <h3>Json документ</h3>
                                    <DialogContent>

                                        <TextField
                                            value={this.state.text} onChange={this.onChange}
                                            multiline={true}
                                            rows={30}
                                            autoFocus
                                            margin="dense"
                                            id="name"
                                            fullWidth
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.onOpenJson}>
                                            Закрыть
                                        </Button>
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