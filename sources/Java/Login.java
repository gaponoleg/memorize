package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.logging.Logger;

@WebServlet(name = "Login", urlPatterns = "/login/")
public class Login extends HttpServlet {
    UsersDBManager usersDBManager;

    @Override
    public void init() throws ServletException {
        super.init();
        String databaseUrl = getServletContext().getInitParameter("databaseUrl");
        String databaseUser = getServletContext().getInitParameter("databaseUser");
        String databasePassword = getServletContext().getInitParameter("databasePassword");
        String databaseDriver = getServletContext().getInitParameter("databaseDriver");
        try {
            Class.forName(databaseDriver);  // Needed for JDK9/Tomcat9
            Connection dbConnection = DriverManager.getConnection(databaseUrl, databaseUser, databasePassword);
            usersDBManager = new UsersDBManager(dbConnection);
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
        usersDBManager.close();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set the MIME type for the response message
        response.setContentType("text/html");
        // Get a output writer to write the response message into the network socket
        PrintWriter out = response.getWriter();
        String login = (String) request.getAttribute("login");
        String password = (String) request.getAttribute("password");
        boolean remember = "on".equals(request.getAttribute("remember"));
        User user = usersDBManager.getUser(login);
        if (user != null && user.getPassword().equals(password))
        {
            response.setStatus(200);
            HttpSession session = request.getSession();
            synchronized (session)
            {
                session.setAttribute("user", user);
            }
            if (remember)
            {
                Utils.addCookie(response,"user", Integer.toString(user.getId()),30*24*60*60); //a month
            }
            else {
                Utils.removeCookie(response, "user");
            }
        }
        else if (user != null)
        {
            response.setStatus(202);
            out.println("Wrong password");
        }
        else {
            response.setStatus(202);
            out.println("No account with such email");
        }
        out.close();  // Close the output writer
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request,response);
    }
}
