package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by Александра on 04.05.2018.
 */
@WebServlet(name = "UpdateProgressHandler", urlPatterns = "/u/updateprogress/")
public class UpdateProgressHandler extends ActionHandler{

    @Override
    public void init() throws ServletException {
        super.init();
        errorMessage = "Error on updating learning progress";
        successMessage = "";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = (User) request.getSession().getAttribute("user");
        int percent;
        int progress;
        try {
            percent = Integer.parseInt((String) request.getAttribute("percent"));
            progress = Integer.parseInt((String) request.getAttribute("progress"));
        }
        catch (NumberFormatException e) {
            response.setStatus(202);
            PrintWriter out = response.getWriter();
            out.print(errorMessage);
            out.close();
            return;
        }
        int inc;
        if (percent > 80)
            inc = 25;
        else if (percent > 50)
            inc = 10;
        else inc = 0;
        if (progress + inc > 100)
        {
            if (inc == 25)
                inc = 100 - progress;
            else
                inc = 0;
        }
        successMessage = Integer.toString(progress + inc);
        if (inc == 0)
        {
            response.setStatus(200);
            PrintWriter out = response.getWriter();
            out.print(successMessage);
            out.close();
        }
        else
        {
            String sqlQuery = "UPDATE notes SET progress=" + (progress + inc) +
                    " WHERE user_id=" + user.getId() + " AND id=" + request.getAttribute("id");
            processQuery(sqlQuery,request,response);
        }
    }
}
