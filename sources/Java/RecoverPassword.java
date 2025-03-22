package memorize;

import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;
import javax.mail.*;

@WebServlet(name = "RecoverPassword",urlPatterns = "/recoverpassword/")
public class RecoverPassword extends HttpServlet {
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

    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Recipient's email ID needs to be mentioned.
        String requestedEmail = (String) request.getAttribute("login");
        PrintWriter out = response.getWriter();
        User user = usersDBManager.getUser(requestedEmail);
        if (user != null)
        {
            // Sender's email ID needs to be mentioned
            String from = "tatasha705@gmail.com";
            // Get system properties
            Properties properties = System.getProperties();
            // Setup mail server
            properties.setProperty("mail.transport.protocol","smtps");
            properties.setProperty("mail.smtps.auth","true");
            properties.setProperty("mail.smtps.host","smtp.gmail.com");
            properties.setProperty("mail.smtps.user",from);
            // Get the default Session object.
            Session session = Session.getDefaultInstance(properties);
            try {
                MimeMessage message = new MimeMessage(session);
                message.setFrom(new InternetAddress(from));
                message.addRecipient(Message.RecipientType.TO, new InternetAddress(requestedEmail));
                message.setSubject("Recover password for account");
                message.setContent("<h1>Hi, " + user.getName() +
                        "!</h1>" +
                        "<p>Recovering password for your account has been requested. Your password is <b>" +
                        user.getPassword() + "</b></p>", "text/html" );

                // Send message
                Transport transport = session.getTransport();
                transport.connect(null,"ahfywepbr");
                transport.sendMessage(message,message.getAllRecipients());
                transport.close();
                response.setStatus(200);
                out.println("A letter with password has been sent on your email");
            } catch (Exception e) {
                response.setStatus(202);
                out.println("Error");
            }
        }
        else {
            response.setStatus(202);
            out.println("No account with such email");
        }
        out.close();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req,resp);
    }
}
