package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;


@WebServlet(name = "ChangePasswordHandler", urlPatterns = "/u/changepassword/")
public class ChangePasswordHandler extends ActionHandler{

    @Override
    public void init() throws ServletException {
        super.init();
        errorMessage = "Internal error";
        successMessage = "Password has been changed";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = (User) request.getSession().getAttribute("user");
        if (user.getPassword().equals(request.getAttribute("current"))) //if user typed valid current password
        {
            String sqlQuery = "UPDATE users SET password='" + request.getAttribute("new") +
                    "' WHERE id=" + user.getId();
            processQuery(sqlQuery,request,response);
            if (response.getStatus() == 200) //if password has been changed successfully update session information about user
            {
                User updated_user = new User(user.getId(),user.getName(),user.getEmail(),(String) request.getAttribute("new"));
                HttpSession session = request.getSession();
                synchronized (session)
                {
                    session.setAttribute("user", updated_user);
                }
            }
        }
        else {
            response.setStatus(202);
            PrintWriter out = response.getWriter();
            out.println("Invalid current password");
            out.close();
        }
    }
}
