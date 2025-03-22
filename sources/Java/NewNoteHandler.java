package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;


@WebServlet(name = "NewNoteHandler", urlPatterns = "/u/newnote/")
public class NewNoteHandler extends ActionHandler {

    @Override
    public void init() throws ServletException {
        super.init();
        errorMessage = "Internal error";
        successMessage = "Note was added";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = (User) request.getSession().getAttribute("user");
        String sqlQuery = "INSERT INTO notes (user_id, title, text, align)" +
                "VALUES (" + user.getId() + ", '" + request.getAttribute("title") +
                "', '" + request.getAttribute("text") + "', '" + request.getAttribute("align") +"');";
        //executes query and in case of success returns created note's id to the client
        processQueryWithReturn(sqlQuery,request,response);
    }
}
