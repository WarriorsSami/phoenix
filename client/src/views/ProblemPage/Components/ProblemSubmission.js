import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import authenticationService from "services/authentication.service";
import evaluatorService from "services/evaluator.service";
import userService from "services/user.service";

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
    container: {
        overflow: "auto",
        maxHeight: "420px",
        padding: "20px",
        border: "1px solid #bdbdbd"
    }
});

const ProblemSubmissions = ({ problem }) => {
    
    const [submissions, setSubmissions] = useState([])
    const isLoggedIn = authenticationService.isLoggedIn();
    const classes = useStyles();

    const fetchSubmissions = async() => {
        if (!isLoggedIn) return;

        const userId = userService.getUserId();

        try {
            const res = await evaluatorService.getSubmissions(userId, problem.id);
            let submissions = res.data;
            
            // sorting in descending order by id
            submissions.sort((a, b) => b.id - a.id);

            setSubmissions(submissions);
        } catch(err) {
            console.error(err);
        }
    }

    if (!isLoggedIn) {
        return (
            <div className={classes.container}>
                <h1 style={{textAlign: "center"}}>You must be logged in to see your submissions!</h1>
            </div>
        );
    }

    useEffect(fetchSubmissions, []);

    if (submissions.length === 0) {
        return (
            <div className={classes.container}>
                <h3 style={{textAlign: "center"}}>No submission yet!</h3>
            </div>
        );
    }

    const submissionStatus = (submission) => {
        if (submission.hasCompileError)
            return "Compile Error";
        if (submission.score === 100)
            return "Accepted";
        return "Not accepted";
    }

    // COLORS TAKEN FROM: https://materializecss.com/color.html
    const submissionRowColor = (submission) => {
        if (submission.score == 0)
            return {backgroundColor: "#b71c1c"}; // red darken-4
        if (submission.score <= 30)
            return {backgroundColor: "#d32f2f"}; // red darken-3
        if (submission.score < 50)
            return {backgroundColor: "#ef5350"}; // red lighten-1
        
        if (submission.score <= 60)
            return {backgroundColor: "#ff9800"}; // orange
        if (submission.score <= 80)
            return {backgroundColor: "#ffa726"}; // orange lighten-2
        if (submission.score < 100)
            return {backgroundColor: "#ffb74d"}; // orange lighten-4
        
        return {backgroundColor: "#388e3c"}; // green darken-2
    }

    return (
        <div className={classes.container}>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Time Submitted</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {submissions.map((row) => (
                        <TableRow key={row.id} style={submissionRowColor(row)}>
                            <TableCell component="th" scope="row">{row.id}</TableCell>
                            <TableCell>{row.createdAt}</TableCell>
                            <TableCell>{submissionStatus(row)}</TableCell>
                            <TableCell align="right">{row.score}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

ProblemSubmissions.prototype = {
    problem: PropTypes.object.isRequired
}  

export default ProblemSubmissions;