import React from 'react';
import { Button, FormControl, TextField } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import stock from '../apis/stock';
import '../css/SearchCard.css';
import '../css/styles.css';
import { FaSearch } from 'react-icons/fa'

const styles = theme => ({
    button: {

    },
    textField: {
        "text-transform": "uppercase"
    },
});

class SearchCard extends React.Component{

    state = {
        stockCode: '',
        isButtonDisabled: true,
        search_stockArray: [],
        loading_api: false
    };

    // @desc: componentDidMount disables the button search when page loads.
    componentDidMount(){
        document.querySelector(".btn-search").disabled = true;

        if(localStorage.getItem("historyStockArray") !== null){
            let lsArray = JSON.parse(localStorage.getItem("historyStockArray"));
            if(window.confirm("You have saved stocks. Would you like to load them?")){
                for(var i = 0; i < lsArray.length; i++){
                    this.sendSearchResult(false, lsArray[i])
                }
            }else{
                localStorage.removeItem("historyStockArray");
            };
        };
    };

    // @desc: componentDidUpdate checks for the value of button and removes
    //        the disabled state.
    componentDidUpdate(){
        if(document.querySelector(".btn-search").value === ''){
            document.querySelector(".btn-search").disabled = true;
        }
    }

    // @desc: when the button is pressed, this runs the API call which checks
    //        for the user's input of the stock code and gets the latest value
    //        by looking at it's current date and 24 hours of endDate. This calls
    //        the tableData and graphData and sends it back up to App.js as props.
    //        It also makes the input null, and also checks if the stock code exists
    //        within the API.
    sendSearchResult = async () => {
        const stockValue = this.state.stockCode;

        let startDate = Math.round(new Date().getTime() / 1000);
        let endDate = startDate - (72 * 3600);
        let checkForExist = false;

        // Prevents duplicates
        if(this.state.search_stockArray.includes(stockValue)){
            alert("Already exists");
            document.querySelector(".stock-code__value").value = '';
        }else{
            checkForExist = true;
        }

        const table_response = await stock.get('/quote', {
            params: {
              symbol: stockValue,
              token: 'bqhq9i7rh5rbubolrqd0'
            }
        });

        if(table_response){
            this.setState({ isButtonDisabled: true });
        }

        const graph_response = await stock.get('/stock/candle', {
            params: {
              symbol: stockValue,
              resolution: 5,
              from: endDate,
              to: startDate,
              token: 'bqhq9i7rh5rbubolrqd0'
            }
        });
        
        this.setState({
            search_stockArray: this.state.search_stockArray.concat(stockValue),
        }, () => {
            if(checkForExist){
                if(table_response.data.c === 0 && table_response.data.h === 0 && table_response.data.l === 0 && table_response.data.o === 0 && table_response.data.pc === 0 && table_response.data.t === 0){
                    this.props.sendSearchGraphResult("no_data", '');
                }else{
                    this.props.sendSearchGraphResult(true, {stockValue, response: graph_response.data});
                    this.props.sendSearchResult(table_response.data);
                    this.setState({ isButtonDisabled: false });
                }
                this.setState({ stockCode: "" });
            };
        });
    };

    changeToUpperCase = () => {
        if (this.state.stockCode && this.state.stockCode.length >= 1) {
            this.setState({ stockCode: this.state.stockCode.toUpperCase() });
        }
    }

    onTextFieldChange = (stockCode) => {
        this.setState({ stockCode });
        if (stockCode.length > 1) {
            this.setState({ isButtonDisabled: false });
        }
    }

    render(){
        const { classes } = this.props;
        return (
            <div className="card card-container search">
                <div className="card-body">
                    <h2 className="h6 mb-0">Search Stock Code:</h2>
                    <TextField className={classes.textField} required label="Stock Code" placeholder="e.g. AAPL" variant="filled" value={this.state.stockCode}
                        onChange={ (e) => this.onTextFieldChange(e.target.value) }
                        onKeyUp={ (e) => this.changeToUpperCase() }>
                    </TextField>
                    <Button className="btn btn-secondary w-100 btn-search" onClick={ () => this.sendSearchResult(true, '') } disabled={this.state.isButtonDisabled}>Search Results<FaSearch /></Button>
                </div>
            </div>
        );
    };
};

export default withStyles(styles)(SearchCard);