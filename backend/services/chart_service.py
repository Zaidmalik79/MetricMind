class ChartService:

    @staticmethod
    def get_bar_chart():
        return [
            {"month": "Jan", "value": 120},
            {"month": "Feb", "value": 180},
            {"month": "Mar", "value": 150},
            {"month": "Apr", "value": 220},
        ]

    @staticmethod
    def get_line_chart():
        return [
            {"month": "Jan", "value": 80},
            {"month": "Feb", "value": 100},
            {"month": "Mar", "value": 140},
            {"month": "Apr", "value": 200},
        ]

    @staticmethod
    def get_pie_chart():
        return [
            {"category": "Sales", "value": 45},
            {"category": "Revenue", "value": 35},
            {"category": "Profit", "value": 20},
        ]

    @staticmethod
    def get_all_charts():
        return {
            "bar": ChartService.get_bar_chart(),
            "line": ChartService.get_line_chart(),
            "pie": ChartService.get_pie_chart(),
        }