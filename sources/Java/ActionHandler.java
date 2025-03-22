package memorize;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;


public abstract class ActionHandler extends HttpServlet {
    protected Connection dbConnection;
    @Override
    public void init() throws ServletException {
        super.init();
        String databaseUrl = getServletContext().getInitParameter("databaseUrl");
        String databaseUser = getServletContext().getInitParameter("databaseUser");
        String databasePassword = getServletContext().getInitParameter("databasePassword");
        String databaseDriver = getServletContext().getInitParameter("databaseDriver");
        try {
            Class.forName(databaseDriver);  // Needed for JDK9/Tomcat9
            dbConnection = DriverManager.getConnection(databaseUrl, databaseUser, databasePassword);
            Utils.logger.info(this.getClass().getName() + " successfully connected to the database.");
        }
        catch (Exception e)
        {
            Utils.logger.severe(this.getClass().getName() + " failed on attempt to connect to the database.");
            e.printStackTrace();
        }
    }

    @Override
    public void destroy() {
        super.destroy();
        try {
            if (dbConnection != null)
                dbConnection.close();
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
    }

    protected String successMessage = "";
    protected String errorMessage = "";

    protected void processQueryWithReturn(String sqlQuery, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        PrintWriter out = response.getWriter();
        response.setContentType("text/html");
        try (PreparedStatement statement = dbConnection.prepareStatement(sqlQuery, Statement.RETURN_GENERATED_KEYS)) {
            int rows = statement.executeUpdate();
            ResultSet res = statement.getGeneratedKeys();
            if (rows == 1 && res.next())
            {
                System.out.println(successMessage + "; generated key: " + res.getInt(1));
                response.setStatus(200);
                out.print(res.getInt(1));
            }
            else throw new Exception(errorMessage);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            response.setStatus(202);
            out.print(errorMessage);
        }
        out.close();
    }

    protected void processQuery(String sqlQuery, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        PrintWriter out = response.getWriter();
        response.setContentType("text/html");
        try (Statement statement = dbConnection.createStatement()) {
            int rows = statement.executeUpdate(sqlQuery);
            if (rows == 1)
            {
                System.out.println(successMessage);
                response.setStatus(200);
                out.print(successMessage);
            }
            else throw new Exception(errorMessage);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            response.setStatus(202);
            out.print(errorMessage);
        }
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request,response);
    }
}
