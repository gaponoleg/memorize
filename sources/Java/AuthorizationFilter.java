package memorize;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.logging.Logger;


@WebFilter(filterName = "AuthorizationFilter", urlPatterns = "/u/")
public class AuthorizationFilter implements Filter {
    UsersDBManager usersDBManager;

    @Override
    public void init(FilterConfig config) throws ServletException {
        String databaseUrl = config.getServletContext().getInitParameter("databaseUrl");
        String databaseUser = config.getServletContext().getInitParameter("databaseUser");
        String databasePassword = config.getServletContext().getInitParameter("databasePassword");
        String databaseDriver = config.getServletContext().getInitParameter("databaseDriver");
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
        usersDBManager.close();
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) resp;
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) {
            String cookieValue = Utils.getCookieValue(request, "user");

            if (cookieValue != null) {
                int id = Integer.parseInt(cookieValue);
                user = usersDBManager.getUser(id);

                if (user != null) {
                    HttpSession session = request.getSession();
                    synchronized (session)
                    {
                        session.setAttribute("user", user);
                    }
                    Utils.addCookie(response,"user", Integer.toString(user.getId()),30*24*60*60);
                } else {
                    Utils.removeCookie(response, "user");
                }
            }
        }
        if (user == null) {
            response.sendRedirect("../");
        } else {
            chain.doFilter(req, resp);
        }
    }
}
