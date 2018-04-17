import React from 'react'
import axios from 'axios'

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: {}
        }
        this.logout = this.logout.bind(this)
    }
    componentDidMount() {
        axios.get('/check').then(resp => {
            this.setState({ user: resp.data })
        })
    }
    logout() {
        console.log('loggin out...')
        axios.get('/logout').then(_ => {
            this.props.history.push('/')
        });
    }
    render() {
        return (
            <div>
                {
                    this.state.user.auth_id ?
                        <div>
                            <div>Welcome, {this.state.user.first_name}</div>
                            <img src={this.state.user.img_url} alt={`url: ${this.state.user.img_url}`} height="100" width="100" />
                            <button onClick={this.logout}>logout</button>
                        </div>
                        :
                        <div>
                            <div>unauthorized</div>
                            <button onClick={this.logout}>back</button>
                        </div>
                }
            </div>
        )
    }
}