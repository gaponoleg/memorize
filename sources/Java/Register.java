package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;


@WebServlet(name = "Register", urlPatterns = "/register/")
public class Register extends HttpServlet {
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
        PrintWriter out = response.getWriter();
        String name = (String) request.getAttribute("name");
        String login = (String) request.getAttribute("login");
        String password = (String) request.getAttribute("password");
        if (usersDBManager.getUser(login) == null) //if such email is not already registered
        {
            User user = usersDBManager.registerUser(name, login, password);
            if (user != null) {
                response.setStatus(200);
                HttpSession session = request.getSession();
                synchronized (session)
                {
                    session.setAttribute("user", user);
                }
                Utils.addCookie(response,"user", Integer.toString(user.getId()),30*24*60*60);
            }
            else {
                response.setStatus(202);
                out.println("Error");
            }
        }
        else {
            response.setStatus(202);
            out.println("This email is already registered");
        }
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
