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


@WebServlet(name = "DeleteAccount", urlPatterns = "/deleteaccount/")
public class DeleteAccount extends HttpServlet {
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
        String password = (String) request.getAttribute("password");
        User user = (User) request.getSession().getAttribute("user");
        if (user.getPassword().equals(password))
        {
            if (usersDBManager.deleteUser(user.getId()))
            {
                response.setStatus(200);
                HttpSession session = request.getSession();
                synchronized (session)
                {
                    session.setAttribute("user", null);
                }
                Utils.removeCookie(response, "user");
            }
        }
        else {
            response.setStatus(202);
            out.println("Wrong password");
        }
        out.close();  // Close the output writer
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request,response);
    }
}
