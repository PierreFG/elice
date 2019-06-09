import React, {Component} from 'react';
import './App.css';

import Columns from '../../components/Columns/Columns'
import Courses from '../../components/Courses/Courses'
import Affectations from '../../components/Affectations/Affectations'
import dataHandler from '../../services/dataHandler'
import reactTableUtil from '../../services/reactTableUtil'

import CSVReader from 'react-csv-reader'
import Container from 'react-bootstrap/Container'
import Jumbotron from 'react-bootstrap/Jumbotron'
import {Col, Row} from 'react-bootstrap'

class App extends Component {
    constructor() {
        super();

        this.state = {
            wishCount: 0,
            columns: [],
            courses: [],
            students: [],
            rtColumns: [{dataField: 'idVent', text: 'Vide'}]
        };
    }

    handleData(data) {
        data = dataHandler.preProcess(data);
        data = dataHandler.createIds(data);
        let cols = dataHandler.getColumns(data);

        this.setState({
            columns: cols,
            courses: [],
            students: data,
            rtColumns: reactTableUtil.columnParser(cols, this.state.courses)
        });
    }

    handleDataError(e) {
        console.log(e);
    }

    getStudentsWishList() {
        let wishlist = [];
        let students = this.state.students;
        let studentId = 0;
        for (let el in students) {
            wishlist[studentId] = [];
            for (let col in students[el]) {
                if (this.state.columns[col] === undefined) {
                    continue;
                }
                if (this.state.columns[col].state === "wish") {
                    let limeSurveyCourseName = students[el][col];
                    let limeSurveyCourseRank = this.state.columns[col].wishNum;
                    let limeSurveyCourseId = this.state.courses[limeSurveyCourseName].id;
                    wishlist[studentId][limeSurveyCourseId] = limeSurveyCourseRank;
                }
            }
            studentId++;
        }
        return wishlist;
    }

    affect() {
        let wishlist = this.getStudentsWishList();

        let data = dataHandler.affect(this.state.students, this.state.courses);
        this.setState({students: data});
    }

    changeColumnMode(e) {
        let value = e.target.value;
        let key = e.target.id;
        let wishCount = this.state.wishCount;
        let columns = {...this.state.columns};

        if (value === "discard") {
            // this.onDeleteWishNum(key);
            // Not even a wish column ! Nothing to be done
            if (this.state.columns[key].wishNum !== -1) {
                // Update the current wish columns count
                wishCount--;

                // Shift other wish columns' numbers
                for (let el in columns) {
                    if (columns[el].wishNum > columns[key].wishNum)
                        columns[el] = {...columns[el], wishNum: columns[el].wishNum - 1};
                }

                // Delete the column's wish number
                columns[key] = {...columns[key], wishNum: -1};
            }
        }

        columns[key] = {...columns[key], state: value};
        this.setState({
            columns: columns,
            rtColumns: reactTableUtil.columnParser(columns, this.state.courses),
            wishCount: wishCount,
            courses: dataHandler.getCourses(this.state.students, columns)
        });
    }

    changeColumnWishNum(e) {
        let value = parseInt(e.target.value);
        let key = e.target.id;
        let wishCount = this.state.wishCount;
        let columns = {...this.state.columns};

        if (value === -1) {
            // this.onDeleteWishNum(key);
            // Not even a wish column ! Nothing to be done
            if (this.state.columns[key].wishNum !== -1) {
                // Update the current wish columns count
                wishCount--;

                // Shift other wish columns' numbers
                for (let el in columns) {
                    if (columns[el].wishNum > columns[key].wishNum)
                        columns[el] = {...columns[el], wishNum: columns[el].wishNum - 1};
                }

                // Delete the column's wish number
                columns[key] = {...columns[key], wishNum: -1};
            }
        } else {
            if (columns[key].wishNum === -1) {
                wishCount++;
                columns[key] = {...columns[key], wishNum: wishCount};
            }

            for (let el in columns) {
                if (columns[el].wishNum === value) {
                    columns[el] = {...columns[el], wishNum: columns[key].wishNum};
                    break;
                }
            }
        }

        columns[key] = {...columns[key], wishNum: value};

        this.setState({
            columns: columns,
            rtColumns: reactTableUtil.columnParser(columns, this.state.courses),
            wishCount: wishCount,
            courses: dataHandler.getCourses(this.state.students, columns)
        });
    }
/*
    onDeleteWishNum(key) {
        // Not even a wish column ! Nothing to be done
        if (this.state.columns[key].wishNum === -1) {
            return;
        }

        let wishCount = this.state.wishCount;
        let columns = {...this.state.columns};

       // Update the current wish columns count
        wishCount--;

        // Shift other wish columns' numbers
        for (let el in columns) {
            if (columns[el].wishNum > columns[key].wishNum)
                columns[el] = {...columns[el], wishNum: columns[el].wishNum - 1};
        }

        // Delete the column's wish number
        columns[key] = {...columns[key], wishNum: -1};
    }
*/
    loadState() {

    }

    saveState() {
        let fileDownload = require('js-file-download');
        let data = encodeURIComponent(JSON.stringify(this.state));
        fileDownload(data, 'state.json');
    }

    render() {
        return (
            <Container fluid={false}>
                <Jumbotron>
                    <h1>Ventilation</h1>
                    <hr/>
                    <CSVReader
                        cssClass="csv-reader-input"
                        label={<span className="mr-1">Fichier CSV à charger : </span>}
                        onFileLoaded={this.handleData.bind(this)}
                        onError={this.handleDataError}
                        parserOptions={{header: true, encoding: "UTF-8"}}
                        inputId="limeSurvey"
                    />
                </Jumbotron>
                <Row>
                    <Col>
                        <Columns wishCount={this.state.wishCount} changeMode={this.changeColumnMode.bind(this)}
                                 changeWishNum={this.changeColumnWishNum.bind(this)} columns={this.state.columns}/>
                    </Col>
                    <Col>
                        <Courses courses={this.state.courses} /*loadData = {this.loadData.bind(this)}*//>
                    </Col>
                </Row>
                <hr/>
                <Affectations students={this.state.students} rtColumns={this.state.rtColumns}
                              affect={this.affect.bind(this)}/>
            </Container>
        );
    }
}

export default App;
